package com.transitpro.nfcreader

import android.Manifest
import android.annotation.SuppressLint
import android.app.PendingIntent
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
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
import com.transitpro.nfcreader.model.TapRequest
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
 * This activity handles NFC card reading, GPS location tracking, and communication with
 * the backend to process passenger taps (tap-in and tap-out). It displays real-time
 * feedback to the driver/conductor regarding the status of the tap and fare calculations.
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
    /** Indicates if the reader is currently active and waiting for an NFC tap. */
    private var isReadyToReceiveTap = false
    /** List of bus stops loaded from assets for nearest stop identification. */
    private var busStops = mutableListOf<StopInfo>()
    /** The ID of the passenger retrieved from the last successful NFC tap. */
    private var passengerId: String? = null
    // endregion

    companion object {
        /** Radius of the Earth in kilometers, used for distance calculations. */
        private const val EARTH_RADIUS_KM = 6372.8
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        initUI() // Initialize UI first to avoid null pointers
        loadBusStops()
        checkLocationPermissions()
        setupHeader()
        initNFC()
        initLocation()
        initVibrator()
        updateTime()
        setupMenuButtons()
    }

    /**
     * Checks and requests necessary location permissions (FINE and COARSE).
     */
    private fun checkLocationPermissions() {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION), 1001)
        }
    }

    /**
     * Sets up the top navigation bar/header UI elements.
     */
    private fun setupHeader() {
        val header = findViewById<View>(R.id.topBar)
        if (header != null) {
            header.findViewById<TextView>(R.id.headerSubText2)?.text = "READER"
            header.findViewById<ImageButton>(R.id.headerMenuButton)?.setOnClickListener { view ->
                showTopMenu(view)
            }
        }
    }

    /**
     * Displays the top-right popup menu for logout and shift management.
     * @param view The view to anchor the popup menu to.
     */
    private fun showTopMenu(view: View) {
        val popup = PopupMenu(this, view)
        popup.menu.add("Log Out / End Shift")

        popup.setOnMenuItemClickListener { item ->
            when (item.title) {
                "Log Out / End Shift" -> {
                    val prefs = getSharedPreferences("TransitProSession", MODE_PRIVATE)
                    val token = prefs.getString("jwt_token", "")
                    
                    // Call backend to log the revocation with explicit token
                    if (!token.isNullOrEmpty()) {
                        RetrofitClient.getInstance(this).logout("Bearer $token").enqueue(object : Callback<Void> {
                            override fun onResponse(call: Call<Void>, response: Response<Void>) {
                                println("Backend logout successful")
                            }
                            override fun onFailure(call: Call<Void>, t: Throwable) {
                                println("Backend logout failed: ${t.message}")
                            }
                        })
                    }

                    println("Session token revoked: $token")

                    // Clear the local session token immediately for better UX
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

    /**
     * Initializes UI components and sets up click listeners for interaction.
     */
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

    /**
     * Configures the NFC Adapter and PendingIntent for foreground dispatch.
     */
    private fun initNFC() {
        nfcAdapter = NfcAdapter.getDefaultAdapter(this)

        if (nfcAdapter == null) {
            showToast("NFC is not supported on this device", false)
            statusText.text = "NFC Not Supported"
            statusIndicator.setBackgroundResource(R.drawable.status_indicator_red)
            return
        }

        if (!nfcAdapter!!.isEnabled) {
            showToast("Please enable NFC in settings", false)
            statusText.text = "NFC Disabled"
            statusIndicator.setBackgroundResource(R.drawable.status_indicator_red)
            return
        }

        // Setup Pending Intent
        val intent = Intent(this, javaClass).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP)
        val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            PendingIntent.FLAG_MUTABLE
        } else {
            PendingIntent.FLAG_UPDATE_CURRENT
        }
        pendingIntent = PendingIntent.getActivity(this, 0, intent, flags)

        // Setup Intent Filters for all types of tags
        val ndef = IntentFilter(NfcAdapter.ACTION_NDEF_DISCOVERED).apply {
            try {
                addDataType("*/*")
            } catch (e: IntentFilter.MalformedMimeTypeException) {
                throw RuntimeException("fail", e)
            }
        }
        val tech = IntentFilter(NfcAdapter.ACTION_TECH_DISCOVERED)
        val tag = IntentFilter(NfcAdapter.ACTION_TAG_DISCOVERED)
        
        intentFiltersArray = arrayOf(ndef, tech, tag)

        statusText.text = "Reader Active"
        statusIndicator.setBackgroundResource(R.drawable.status_indicator_green)
    }

    /**
     * Initializes the Fused Location Provider and sets up the location callback.
     */
    private fun initLocation() {
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
        
        locationCallback = object : LocationCallback() {
            override fun onLocationResult(locationResult: LocationResult) {
                lastKnownLocation = locationResult.lastLocation
            }
        }
        startLocationUpdates()
    }

    /**
     * Requests continuous location updates to maintain accurate proximity to bus stops.
     */
    @SuppressLint("MissingPermission")
    private fun startLocationUpdates() {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            val locationRequest = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 5000)
                .setMinUpdateIntervalMillis(2000)
                .build()
            fusedLocationClient.requestLocationUpdates(locationRequest, locationCallback, mainLooper)
        }
    }

    /**
     * Initializes the vibrator service for tactile feedback.
     */
    private fun initVibrator() {
        vibrator = getSystemService(VIBRATOR_SERVICE) as Vibrator
    }

    /**
     * Triggers a short vibration effect to indicate a successful NFC tap.
     */
    private fun vibrateOnTap() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrator.vibrate(VibrationEffect.createOneShot(200, VibrationEffect.DEFAULT_AMPLITUDE))
        } else {
            vibrator.vibrate(200)
        }
    }

    /**
     * Updates the time display on the UI with the current system time.
     */
    @SuppressLint("SetTextI18n")
    private fun updateTime() {
        val currentTime = SimpleDateFormat("hh:mm a", Locale.getDefault()).format(Date())
        timeText.text = currentTime
    }

    /**
     * Sets up the bottom navigation menu buttons and their respective click listeners.
     */
    private fun setupMenuButtons() {
        val footer = findViewById<View>(R.id.bottomNav)
        if (footer != null) {
            footer.findViewById<ImageButton>(R.id.menuHome)?.apply {
                setColorFilter(ContextCompat.getColor(this@MainActivity, R.color.accent_green))
                setOnClickListener {
                    showToast("Home", true)
                    resetTripState()
                }
            }

            footer.findViewById<ImageButton>(R.id.menuHistory)?.setOnClickListener {
                val intent = Intent(this, HistoryActivity::class.java)
                startActivity(intent)
            }

            footer.findViewById<ImageButton>(R.id.menuRoutes)?.setOnClickListener {
                val intent = Intent(this, RoutesActivity::class.java)
                startActivity(intent)
            }

            footer.findViewById<ImageButton>(R.id.menuSettings)?.setOnClickListener {
                startActivity(Intent(this, SettingsActivity::class.java))
            }
        }
    }

    override fun onResume() {
        super.onResume()
        
        // Security Check: If token was cleared (e.g. by another device login), return to Login
        val prefs = getSharedPreferences("TransitProSession", MODE_PRIVATE)
        if (prefs.getString("jwt_token", "").isNullOrEmpty()) {
            val intent = Intent(this, LoginActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            startActivity(intent)
            finish()
            return
        }

        nfcAdapter?.enableForegroundDispatch(this, pendingIntent, intentFiltersArray, techListsArray)
        updateTime()
        startLocationUpdates()
    }

    override fun onPause() {
        fusedLocationClient.removeLocationUpdates(locationCallback)
        if (this.isFinishing) {
            nfcAdapter?.disableForegroundDispatch(this)
        }
        super.onPause()
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleNFCTap(intent)
    }

    /**
     * Processes a detected NFC tap when the reader is active.
     * Extracts the tag and attempts to read the passenger ID.
     * @param intent The intent containing the NFC tag data.
     */
    @SuppressLint("SetTextI18n")
    private fun handleNFCTap(intent: Intent) {
        if (!isReadyToReceiveTap) return

        val tag = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            intent.getParcelableExtra(NfcAdapter.EXTRA_TAG, Tag::class.java)
        } else {
            @Suppress("DEPRECATION")
            intent.getParcelableExtra(NfcAdapter.EXTRA_TAG)
        }

        if (tag != null) {
            isReadyToReceiveTap = false
            vibrateOnTap()
            nfcIcon.clearAnimation()
            statusText.text = "Reader Active"
            btnCancelTap.visibility = View.GONE

            // Read Passenger ID from NFC Card
            passengerId = readPassengerIdFromTag(tag)

            if (passengerId.isNullOrEmpty()) {
                showToast("Invalid NFC Card. Please use registered transit card.", false)
                return
            }

            // Use the continuously updated location for instant response
            if (lastKnownLocation != null) {
                val currentStop = findNearestStop(lastKnownLocation!!.latitude, lastKnownLocation!!.longitude)
                processTap(passengerId!!, currentStop, lastKnownLocation!!.latitude, lastKnownLocation!!.longitude)
            } else {
                // Quick feedback before location lookup
                showToast("Acquiring location...", true)
                getCurrentLocation { location ->
                    if (location != null) {
                        val currentStop = findNearestStop(location.latitude, location.longitude)
                        processTap(passengerId!!, currentStop, location.latitude, location.longitude)
                    } else {
                        showToast("Unable to get GPS location. Please ensure location is enabled.", false)
                    }
                }
            }
        }
    }

    /**
     * Reads the passenger ID from an NFC tag.
     * It first tries to read NDEF data; if unavailable, it uses the raw tag ID (Hex).
     * @param tag The NFC tag to read from.
     * @return The passenger ID string, or null if reading fails.
     */
    private fun readPassengerIdFromTag(tag: Tag): String? {
        val ndef = Ndef.get(tag)
        
        // If tag is not NDEF formatted, return the raw serial number (Hex) as ID
        if (ndef == null) {
            return tag.id.joinToString("") { String.format("%02X", it) }
        }

        return try {
            ndef.connect()
            val ndefMessage = ndef.ndefMessage
            val records = ndefMessage?.records

            if (records != null && records.isNotEmpty()) {
                val payload = records[0].payload
                if (payload.size > 0) {
                    // Detect if it's a Text record (starts with language code length)
                    val langCodeLen = (payload[0].toInt() and 0x3F)
                    if (langCodeLen < payload.size) {
                        String(payload, langCodeLen + 1, payload.size - langCodeLen - 1)
                    } else {
                        tag.id.joinToString("") { String.format("%02X", it) }
                    }
                } else {
                    tag.id.joinToString("") { String.format("%02X", it) }
                }
            } else {
                tag.id.joinToString("") { String.format("%02X", it) }
            }
        } catch (e: Exception) {
            tag.id.joinToString("") { String.format("%02X", it) }
        } finally {
            try {
                ndef.close()
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    /**
     * Retrieves the current device location with a fallback to the last known location.
     * @param callback Function to be called with the resulting [Location] object.
     */
    @SuppressLint("MissingPermission")
    private fun getCurrentLocation(callback: (Location?) -> Unit) {
        try {
            fusedLocationClient.getCurrentLocation(Priority.PRIORITY_HIGH_ACCURACY, null)
                .addOnSuccessListener { location ->
                    if (location != null) {
                        callback(location)
                    } else {
                        // Fallback to last location if fresh location is null
                        fusedLocationClient.lastLocation.addOnSuccessListener { lastLoc ->
                            callback(lastLoc)
                        }
                    }
                }.addOnFailureListener {
                    callback(null)
                }
        } catch (e: SecurityException) {
            callback(null)
        }
    }

    /**
     * Sends the tap information to the backend API.
     * @param passengerId The ID of the passenger who tapped.
     * @param currentStop The name of the nearest identified bus stop.
     * @param lat The latitude at the time of tapping.
     * @param lon The longitude at the time of tapping.
     */
    @SuppressLint("SetTextI18n")
    private fun processTap(passengerId: String, currentStop: String, lat: Double, lon: Double) {
        val request = TapRequest(
            passengerId = passengerId,
            stop = currentStop,
            timestamp = System.currentTimeMillis(),
            busId = busIdText.text.toString(),
            latitude = lat,
            longitude = lon
        )

        // Using getInstance(this) ensures the JWT token is sent in the header
        RetrofitClient.getInstance(this).sendTap(request).enqueue(object : Callback<TapResponse> {
            override fun onResponse(call: Call<TapResponse>, response: Response<TapResponse>) {
                if (response.isSuccessful) {
                    val result = response.body()
                    if (result != null && result.success) {
                        handleTapSuccess(result, currentStop)
                    } else {
                        showToast(result?.message ?: "Tap processing failed", false)
                    }
                } else {
                    showToast("Server Error: ${response.code()}", false)
                }
            }

            override fun onFailure(call: Call<TapResponse>, t: Throwable) {
                showToast("Network Error: ${t.message}", false)
            }
        })

        // Reset icon color after 2 seconds
        nfcCard.postDelayed({
            nfcIcon.setColorFilter(ContextCompat.getColor(this@MainActivity, R.color.accent_green))
        }, 2000)
    }

    /**
     * Handles the successful response from the backend after a tap.
     * Updates the UI and shows a detailed result dialog.
     * @param result The response body containing tap details (type, fare, etc.).
     * @param currentStop The stop where the tap occurred.
     */
    private fun handleTapSuccess(result: TapResponse, currentStop: String) {
        val dialogTitle: String
        val dialogMessage: String

        when (result.type) {
            "TAP_IN" -> {
                dialogTitle = "Tap In Successful"
                dialogMessage = "Passenger ID: ${result.passengerId}\n" +
                        "Stop: $currentStop\n" +
                        "Time: ${SimpleDateFormat("hh:mm:ss a", Locale.getDefault()).format(Date())}"

                nfcIcon.setColorFilter(ContextCompat.getColor(this, R.color.accent_green))
                showToast("Welcome aboard!", true)
            }
            "CANCELLED" -> {
                dialogTitle = "Ride Cancelled"
                dialogMessage = "Passenger ID: ${result.passengerId}\n" +
                        "Status: Cancelled within 5 seconds\n" +
                        "No fare was charged."

                nfcIcon.setColorFilter(ContextCompat.getColor(this, R.color.accent_red))
                showToast("Ride Cancelled", false)
            }
            else -> {
                dialogTitle = "Tap Out Successful"
                dialogMessage = "Passenger ID: ${result.passengerId}\n" +
                        "From: ${result.origin}\n" +
                        "To: ${result.destination}\n" +
                        "Fare: Rs. ${result.fare}\n" +
                        "Duration: ${result.duration} mins"

                nfcIcon.setColorFilter(ContextCompat.getColor(this, R.color.accent_orange))
                showToast("Fare Paid: Rs. ${result.fare}", true)
            }
        }

        showTapResultDialog(dialogTitle, dialogMessage)
    }

    /**
     * Displays an AlertDialog with the results of the tap transaction.
     * @param title The title of the dialog.
     * @param message The detailed information to display in the dialog body.
     */
    private fun showTapResultDialog(title: String, message: String) {
        AlertDialog.Builder(this)
            .setTitle(title)
            .setMessage(message)
            .setPositiveButton("OK") { dialog, _ ->
                dialog.dismiss()
            }
            .setCancelable(false)
            .show()
    }

    /**
     * Resets the local trip state.
     * (Currently managed primarily by the backend).
     */
    private fun resetTripState() {
        // No longer needed as state is managed by backend
    }

    /**
     * Loads bus stop information (name, lat, lon) from the 'location.json' asset file.
     */
    private fun loadBusStops() {
        try {
            val jsonString = assets.open("location.json").bufferedReader().use { it.readText() }
            val jsonObject = JSONObject(jsonString)
            val locationsArray = jsonObject.getJSONArray("locations")
            for (i in 0 until locationsArray.length()) {
                val stopObj = locationsArray.getJSONObject(i)
                busStops.add(
                    StopInfo(
                        stopObj.getString("name"),
                        stopObj.getDouble("latitude"),
                        stopObj.getDouble("longitude")
                    )
                )
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    /**
     * Finds the nearest bus stop from the provided coordinates using the Haversine formula.
     * @param latitude Current latitude.
     * @param longitude Current longitude.
     * @return The name of the nearest stop.
     */
    private fun findNearestStop(latitude: Double, longitude: Double): String {
        if (busStops.isEmpty()) return "Unknown Stop"

        var nearestStop = busStops[0]
        var minDistance = Double.MAX_VALUE

        for (stop in busStops) {
            val distance = haversine(latitude, longitude, stop.latitude, stop.longitude)
            if (distance < minDistance) {
                minDistance = distance
                nearestStop = stop
            }
        }
        return nearestStop.name
    }

    /**
     * Calculates the distance between two coordinates using the Haversine formula.
     * @param lat1 Latitude of first point.
     * @param lon1 Longitude of first point.
     * @param lat2 Latitude of second point.
     * @param lon2 Longitude of second point.
     * @return Distance in kilometers.
     */
    private fun haversine(lat1: Double, lon1: Double, lat2: Double, lon2: Double): Double {
        val dLat = Math.toRadians(lat2 - lat1)
        val dLon = Math.toRadians(lon2 - lon1)
        val a = sin(dLat / 2).pow(2) +
                cos(Math.toRadians(lat1)) * cos(Math.toRadians(lat2)) *
                sin(dLon / 2).pow(2)
        val c = 2 * atan2(sqrt(a), sqrt(1 - a))
        return EARTH_RADIUS_KM * c
    }

    /**
     * Calculates the distance in kilometers between two named bus stops.
     * @param stop1Name Name of the first stop.
     * @param stop2Name Name of the second stop.
     * @return Distance in kilometers.
     */
    private fun calculateDistanceBetweenStops(stop1Name: String, stop2Name: String): Double {
        val stop1 = busStops.find { it.name == stop1Name }
        val stop2 = busStops.find { it.name == stop2Name }

        if (stop1 != null && stop2 != null) {
            return haversine(stop1.latitude, stop1.longitude, stop2.latitude, stop2.longitude)
        }
        return 0.0
    }

    /**
     * Calculates the fare based on the distance traveled.
     * @param distanceKm The distance in kilometers.
     * @return The calculated fare as an integer.
     */
    private fun calculateFare(distanceKm: Double): Int {
        return when {
            distanceKm <= 10 -> 18
            distanceKm <= 20 -> 25
            distanceKm <= 30 -> 30
            distanceKm <= 40 -> 35
            else -> 40
        }
    }

    /**
     * Displays a toast message and a temporary floating UI notification.
     * @param message The text to display.
     * @param isSuccess True if the notification is for a success event (green background),
     * false for errors/warnings (red background).
     */
    private fun showToast(message: String, isSuccess: Boolean) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show()

        // Show floating message
        toastMessage.text = message
        toastMessage.visibility = View.VISIBLE
        toastMessage.setBackgroundColor(
            if (isSuccess) android.graphics.Color.parseColor("#4CAF50")
            else android.graphics.Color.parseColor("#F44336")
        )

        toastMessage.postDelayed({
            toastMessage.visibility = View.GONE
        }, 3000)
    }
}

/**
 * Data class representing a bus stop.
 * @property name The name of the stop.
 * @property latitude The geographical latitude.
 * @property longitude The geographical longitude.
 */
data class StopInfo(
    val name: String,
    val latitude: Double,
    val longitude: Double
)
