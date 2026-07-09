package com.transitpro.nfcreader

import android.Manifest
import android.annotation.SuppressLint
import android.app.PendingIntent
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.graphics.Color
import android.location.Location
import android.nfc.NdefMessage
import android.nfc.NdefRecord
import android.nfc.NfcAdapter
import android.nfc.Tag
import android.nfc.tech.Ndef
import android.nfc.tech.NfcF
import android.os.Build
import android.os.Bundle
import android.os.VibrationEffect
import android.os.Vibrator
import android.view.View
import android.view.animation.AnimationUtils
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.PopupMenu
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.cardview.widget.CardView
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.google.android.gms.location.*
import com.transitpro.nfcreader.api.RetrofitClient
import com.transitpro.nfcreader.model.TapResponse
import org.json.JSONObject
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.text.SimpleDateFormat
import java.util.*
import kotlin.math.*

/**
 * The main activity of the TransitPro NFC Reader application.
 *
 * Handles encrypted NFC card reading and passenger validation.
 */
class MainActivity : AppCompatActivity() {

    // region UI Components
    private lateinit var nfcCard: CardView
    private lateinit var nfcIcon: ImageView
    private lateinit var statusIndicator: View
    private lateinit var statusText: TextView
    private lateinit var timeText: TextView
    private lateinit var busIdText: TextView
    private lateinit var toastMessage: TextView
    private lateinit var btnCancelTap: View
    // endregion

    // region NFC Components
    private var nfcAdapter: NfcAdapter? = null
    private var pendingIntent: PendingIntent? = null
    private var intentFiltersArray: Array<IntentFilter>? = null
    private val techListsArray: Array<Array<String>>? = null
    // endregion

    // region Location Components
    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private var lastKnownLocation: Location? = null
    private lateinit var locationCallback: LocationCallback
    // endregion

    // region Vibration
    private lateinit var vibrator: Vibrator
    // endregion

    // region Current Trip State
    private var isReadyToReceiveTap = false
    private var busStops = mutableListOf<StopInfo>()
    // endregion

    companion object {
        private const val EARTH_RADIUS_KM = 6372.8
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        initUI()
        loadBusStops()
        checkLocationPermissions()
        setupHeader()
        initNFC()
        initLocation()
        initVibrator()
        updateTime()
        setupMenuButtons()
    }

    private fun checkLocationPermissions() {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION), 1001)
        }
    }

    private fun setupHeader() {
        val header = findViewById<View>(R.id.topBar)
        if (header != null) {
            header.findViewById<TextView>(R.id.headerSubText2)?.text = "READER"
            header.findViewById<ImageButton>(R.id.headerMenuButton)?.setOnClickListener { view ->
                showTopMenu(view)
            }
        }
    }

    private fun showTopMenu(view: View) {
        val popup = PopupMenu(this, view)
        popup.menu.add("Log Out / End Shift")

        popup.setOnMenuItemClickListener { item ->
            when (item.title) {
                "Log Out / End Shift" -> {
                    val prefs = getSharedPreferences("TransitProSession", MODE_PRIVATE)
                    val token = prefs.getString("jwt_token", "")
                    
                    if (!token.isNullOrEmpty()) {
                        RetrofitClient.getInstance(this).logout("Bearer $token").enqueue(object : Callback<Void> {
                            override fun onResponse(call: Call<Void>, response: Response<Void>) {}
                            override fun onFailure(call: Call<Void>, t: Throwable) {}
                        })
                    }

                    prefs.edit().clear().apply()
                    val intent = Intent(this, LoginActivity::class.java)
                    intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                    startActivity(intent)
                    finish()
                }
            }
            true
        }
        popup.show()
    }

    private fun initUI() {
        nfcCard = findViewById(R.id.nfcCard)
        nfcIcon = findViewById(R.id.nfcIcon)
        statusIndicator = findViewById(R.id.statusIndicator)
        statusText = findViewById(R.id.statusText)
        timeText = findViewById(R.id.timeText)
        busIdText = findViewById(R.id.busIdText)
        toastMessage = findViewById(R.id.toastMessage)
        btnCancelTap = findViewById(R.id.btnCancelTap)

        nfcCard.setOnClickListener {
            isReadyToReceiveTap = true
            val pulse = AnimationUtils.loadAnimation(this, R.anim.pulse)
            nfcIcon.startAnimation(pulse)
            statusText.text = "Ready to receive tap..."
            statusIndicator.setBackgroundResource(R.drawable.status_indicator_green)
            btnCancelTap.visibility = View.VISIBLE
        }

        btnCancelTap.setOnClickListener {
            isReadyToReceiveTap = false
            nfcIcon.clearAnimation()
            statusText.text = "Reader Active"
            btnCancelTap.visibility = View.GONE
        }
    }

    private fun initNFC() {
        nfcAdapter = NfcAdapter.getDefaultAdapter(this)
        if (nfcAdapter == null || !nfcAdapter!!.isEnabled) return

        val intent = Intent(this, javaClass).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP)
        val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) PendingIntent.FLAG_MUTABLE else PendingIntent.FLAG_UPDATE_CURRENT
        pendingIntent = PendingIntent.getActivity(this, 0, intent, flags)

        val filters = arrayOf(
            IntentFilter(NfcAdapter.ACTION_NDEF_DISCOVERED).apply { addDataType("*/*") },
            IntentFilter(NfcAdapter.ACTION_TECH_DISCOVERED),
            IntentFilter(NfcAdapter.ACTION_TAG_DISCOVERED)
        )
        intentFiltersArray = filters
    }

    private fun initLocation() {
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
        locationCallback = object : LocationCallback() {
            override fun onLocationResult(locationResult: LocationResult) {
                lastKnownLocation = locationResult.lastLocation
            }
        }
    }

    @SuppressLint("MissingPermission")
    private fun startLocationUpdates() {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            val locationRequest = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 5000).build()
            fusedLocationClient.requestLocationUpdates(locationRequest, locationCallback, mainLooper)
        }
    }

    private fun initVibrator() { vibrator = getSystemService(VIBRATOR_SERVICE) as Vibrator }

    private fun vibrateOnTap() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) vibrator.vibrate(VibrationEffect.createOneShot(200, VibrationEffect.DEFAULT_AMPLITUDE))
        else vibrator.vibrate(200)
    }

    @SuppressLint("SetTextI18n")
    private fun updateTime() {
        timeText.text = SimpleDateFormat("hh:mm a", Locale.getDefault()).format(Date())
    }

    private fun setupMenuButtons() {
        val footer = findViewById<View>(R.id.bottomNav) ?: return
        footer.findViewById<ImageButton>(R.id.menuHistory)?.setOnClickListener { startActivity(Intent(this, HistoryActivity::class.java)) }
        footer.findViewById<ImageButton>(R.id.menuRoutes)?.setOnClickListener { startActivity(Intent(this, RoutesActivity::class.java)) }
        footer.findViewById<ImageButton>(R.id.menuSettings)?.setOnClickListener { startActivity(Intent(this, SettingsActivity::class.java)) }
    }

    override fun onResume() {
        super.onResume()
        val prefs = getSharedPreferences("TransitProSession", MODE_PRIVATE)
        if (prefs.getString("jwt_token", "").isNullOrEmpty()) {
            startActivity(Intent(this, LoginActivity::class.java).apply { flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK })
            finish()
            return
        }
        nfcAdapter?.enableForegroundDispatch(this, pendingIntent, intentFiltersArray, techListsArray)
        startLocationUpdates()
    }

    override fun onPause() {
        fusedLocationClient.removeLocationUpdates(locationCallback)
        nfcAdapter?.disableForegroundDispatch(this)
        super.onPause()
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        if (isReadyToReceiveTap) handleNFCTap(intent)
    }

    private fun handleNFCTap(intent: Intent) {
        val tag: Tag? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) intent.getParcelableExtra(NfcAdapter.EXTRA_TAG, Tag::class.java)
        else intent.getParcelableExtra(NfcAdapter.EXTRA_TAG)

        if (tag != null) {
            isReadyToReceiveTap = false
            vibrateOnTap()
            nfcIcon.clearAnimation()
            statusText.text = "Reader Active"
            btnCancelTap.visibility = View.GONE
            
            // Read Encrypted Content from NFC Card
            val encryptedData = readPassengerIdFromTag(tag)

            if (encryptedData.isNullOrEmpty()) {
                showToast("Invalid card data format.", false)
                return
            }

            getCurrentLocation { location ->
                val currentStop = if (location != null) findNearestStop(location.latitude, location.longitude) else "Unknown"
                processTap(encryptedData, currentStop, location?.latitude ?: 0.0, location?.longitude ?: 0.0)
            }
        }
    }

    private fun readPassengerIdFromTag(tag: Tag): String? {
        val ndef = Ndef.get(tag) ?: return null
        return try {
            ndef.connect()
            val records = ndef.ndefMessage?.records ?: return null
            if (records.isNotEmpty()) {
                val payload = records[0].payload
                val langCodeLen = (payload[0].toInt() and 0x3F)
                String(payload, langCodeLen + 1, payload.size - langCodeLen - 1)
            } else null
        } catch (e: Exception) { null } finally { try { ndef.close() } catch (e: Exception) {} }
    }

    private fun getCurrentLocation(callback: (Location?) -> Unit) {
        if (lastKnownLocation != null) callback(lastKnownLocation)
        else {
            if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
                fusedLocationClient.lastLocation.addOnSuccessListener { callback(it) }
            } else callback(null)
        }
    }

    private fun processTap(encryptedId: String, currentStop: String, lat: Double, lon: Double) {
        val request = mapOf(
            "encryptedPassengerId" to encryptedId,
            "stop" to currentStop,
            "timestamp" to System.currentTimeMillis(),
            "busId" to busIdText.text.toString(),
            "latitude" to lat,
            "longitude" to lon
        )

        RetrofitClient.getInstance(this).sendTap(request).enqueue(object : Callback<TapResponse> {
            override fun onResponse(call: Call<TapResponse>, response: Response<TapResponse>) {
                if (response.isSuccessful) {
                    val result = response.body()
                    if (result != null && result.success) handleTapSuccess(result, currentStop)
                    else showToast(result?.message ?: "Tap failed", false)
                } else {
                    val error = response.errorBody()?.string() ?: ""
                    if (error.contains("Passenger not registered")) showToast("Error: Passenger not registered", false)
                    else showToast("Server Error: ${response.code()}", false)
                }
            }
            override fun onFailure(call: Call<TapResponse>, t: Throwable) { showToast("Network Error", false) }
        })
    }

    private fun handleTapSuccess(result: TapResponse, currentStop: String) {
        val title = when(result.type) {
            "TAP_IN" -> "Tap In Successful"
            "CANCELLED" -> "Ride Cancelled"
            else -> "Tap Out Successful"
        }
        val message = when(result.type) {
            "TAP_IN" -> "Welcome aboard!\nStop: $currentStop"
            "CANCELLED" -> "Cancelled within 5 seconds.\nNo fare charged."
            else -> "Origin: ${result.origin}\nFare: Rs. ${result.fare}"
        }
        AlertDialog.Builder(this).setTitle(title).setMessage(message).setPositiveButton("OK", null).show()
    }

    private fun loadBusStops() {
        try {
            val json = assets.open("location.json").bufferedReader().use { it.readText() }
            val array = JSONObject(json).getJSONArray("locations")
            for (i in 0 until array.length()) {
                val obj = array.getJSONObject(i)
                busStops.add(StopInfo(obj.getString("name"), obj.getDouble("latitude"), obj.getDouble("longitude")))
            }
        } catch (e: Exception) {}
    }

    private fun findNearestStop(lat: Double, lon: Double): String {
        var nearest = "Unknown"
        var min = Double.MAX_VALUE
        for (stop in busStops) {
            val d = haversine(lat, lon, stop.latitude, stop.longitude)
            if (d < min) { min = d; nearest = stop.name }
        }
        return nearest
    }

    private fun haversine(lat1: Double, lon1: Double, lat2: Double, lon2: Double): Double {
        val dLat = Math.toRadians(lat2 - lat1)
        val dLon = Math.toRadians(lon2 - lon1)
        val a = sin(dLat/2).pow(2) + cos(Math.toRadians(lat1)) * cos(Math.toRadians(lat2)) * sin(dLon/2).pow(2)
        return EARTH_RADIUS_KM * 2 * atan2(sqrt(a), sqrt(1-a))
    }

    private fun showToast(message: String, isSuccess: Boolean) {
        toastMessage.text = message
        toastMessage.visibility = View.VISIBLE
        toastMessage.setBackgroundColor(if (isSuccess) Color.parseColor("#4CAF50") else Color.parseColor("#F44336"))
        toastMessage.postDelayed({ toastMessage.visibility = View.GONE }, 3000)
    }
}

data class StopInfo(val name: String, val latitude: Double, val longitude: Double)
