package com.transitpro.nfcreader

import android.Manifest
import android.annotation.SuppressLint
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Color
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.PopupMenu
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.gms.location.*
import org.json.JSONObject
import java.io.IOException
import kotlin.math.*

/**
 * Activity that displays the bus route and dynamically updates the current stop
 * based on the device's GPS location.
 */
class RoutesActivity : AppCompatActivity() {

    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private lateinit var locationCallback: LocationCallback
    private lateinit var adapter: RoutesAdapter
    private var stopsList = mutableListOf<RouteStop>()
    
    companion object {
        /** Radius of the Earth in kilometers. */
        private const val EARTH_RADIUS_KM = 6372.8
        /** Threshold distance in meters to consider the bus as having arrived at a stop. */
        private const val ARRIVAL_THRESHOLD_METERS = 10.0
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_routes)

        setupHeader()
        setupFooter()
        
        stopsList.addAll(loadStopsFromJson())
        setupRecyclerView()
        
        initLocation()

        findViewById<View>(R.id.fabRefresh).setOnClickListener {
            refreshLocation()
        }
    }

    private fun refreshLocation() {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            Toast.makeText(this, "Refreshing Location...", Toast.LENGTH_SHORT).show()
            fusedLocationClient.lastLocation.addOnSuccessListener { location ->
                if (location != null) {
                    updateCurrentLocation(location)
                } else {
                    // If last location is null, request a fresh one
                    fusedLocationClient.getCurrentLocation(Priority.PRIORITY_HIGH_ACCURACY, null)
                        .addOnSuccessListener { freshLocation ->
                            updateCurrentLocation(freshLocation)
                        }
                }
            }
        }
    }

    private fun setupHeader() {
        val header = findViewById<View>(R.id.topBar)
        header.findViewById<TextView>(R.id.headerSubText2).text = "ROUTES"
        header.findViewById<ImageButton>(R.id.headerMenuButton).setOnClickListener { view ->
            showTopMenu(view)
        }
    }

    private fun showTopMenu(view: View) {
        val popup = PopupMenu(this, view)
        popup.menu.add("Log Out / End Shift")

        popup.setOnMenuItemClickListener { item ->
            when (item.title) {
                "Log Out / End Shift" -> {
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

    private fun setupFooter() {
        val footer = findViewById<View>(R.id.bottomNav)
        footer.findViewById<ImageButton>(R.id.menuRoutes).setColorFilter(
            ContextCompat.getColor(this, R.color.accent_green)
        )

        footer.findViewById<ImageButton>(R.id.menuHome).setOnClickListener {
            val intent = Intent(this, MainActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
            startActivity(intent)
            finish()
        }
        
        footer.findViewById<ImageButton>(R.id.menuHistory).setOnClickListener {
            val intent = Intent(this, HistoryActivity::class.java)
            startActivity(intent)
            finish()
        }

        footer.findViewById<ImageButton>(R.id.menuSettings).setOnClickListener {
            startActivity(Intent(this, SettingsActivity::class.java))
            finish()
        }
    }

    private fun setupRecyclerView() {
        val recyclerView = findViewById<RecyclerView>(R.id.routesRecyclerView)
        recyclerView.layoutManager = LinearLayoutManager(this)
        adapter = RoutesAdapter(stopsList)
        recyclerView.adapter = adapter
    }

    /**
     * Loads bus stop information from assets and initializes the stops list.
     */
    private fun loadStopsFromJson(): List<RouteStop> {
        val stops = mutableListOf<RouteStop>()
        try {
            val jsonString = assets.open("location.json").bufferedReader().use { it.readText() }
            val jsonObject = JSONObject(jsonString)
            val locationsArray = jsonObject.getJSONArray("locations")
            
            for (i in 0 until locationsArray.length()) {
                val stopObj = locationsArray.getJSONObject(i)
                val name = stopObj.getString("name")
                val lat = stopObj.getDouble("latitude")
                val lon = stopObj.getDouble("longitude")
                
                stops.add(
                    RouteStop(
                        name = name,
                        status = "DISTANCE: --",
                        address = "$name Station Area",
                        isCurrent = false,
                        latitude = lat,
                        longitude = lon
                    )
                )
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        return stops
    }

    /**
     * Initializes the location provider and starts listening for updates.
     */
    private fun initLocation() {
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
        locationCallback = object : LocationCallback() {
            override fun onLocationResult(locationResult: LocationResult) {
                updateCurrentLocation(locationResult.lastLocation)
            }
        }
        startLocationUpdates()
    }

    @SuppressLint("MissingPermission")
    private fun startLocationUpdates() {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            val locationRequest = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 3000)
                .setMinUpdateIntervalMillis(1000)
                .build()
            fusedLocationClient.requestLocationUpdates(locationRequest, locationCallback, mainLooper)
        }
    }

    /**
     * Updates the UI list based on the current GPS location.
     * Highlights the stop if the bus is within the arrival threshold.
     */
    @SuppressLint("NotifyDataSetChanged")
    private fun updateCurrentLocation(location: android.location.Location?) {
        if (location == null) return

        var changed = false
        for (i in stopsList.indices) {
            val stop = stopsList[i]
            val distanceKm = haversine(location.latitude, location.longitude, stop.latitude, stop.longitude)
            val distanceMeters = distanceKm * 1000

            val isNear = distanceMeters <= ARRIVAL_THRESHOLD_METERS
            val statusText = if (distanceMeters < 1000) {
                "DISTANCE: ${distanceMeters.toInt()}m"
            } else {
                "DISTANCE: ${String.format("%.2f", distanceKm)}km"
            }

            // Only update and notify if there's a visible change
            if (stop.isCurrent != isNear || stop.status != statusText) {
                stopsList[i] = stop.copy(isCurrent = isNear, status = statusText)
                changed = true
            }
        }

        if (changed) {
            adapter.notifyDataSetChanged()
        }
    }

    /**
     * Calculates the distance between two points using the Haversine formula.
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

        startLocationUpdates()
    }

    override fun onPause() {
        super.onPause()
        fusedLocationClient.removeLocationUpdates(locationCallback)
    }
}

/**
 * Data class representing a stop in the route list.
 */
data class RouteStop(
    val name: String,
    var status: String,
    val address: String,
    var isCurrent: Boolean,
    val latitude: Double,
    val longitude: Double
) {
    // Helper to create a copy with updated state
    fun copy(isCurrent: Boolean, status: String) = RouteStop(name, status, address, isCurrent, latitude, longitude)
}

/**
 * Adapter for displaying the list of stops in the route.
 */
class RoutesAdapter(private val stops: List<RouteStop>) :
    RecyclerView.Adapter<RoutesAdapter.ViewHolder>() {

    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val stopName: TextView = view.findViewById(R.id.stopName)
        val arrivalStatus: TextView = view.findViewById(R.id.arrivalStatus)
        val stopAddress: TextView = view.findViewById(R.id.stopAddress)
        val stopIcon: ImageView = view.findViewById(R.id.stopIcon)
        val iconContainer: View = view.findViewById(R.id.stopIconContainer)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_route_stop, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val stop = stops[position]
        holder.stopName.text = stop.name
        holder.arrivalStatus.text = stop.status
        holder.stopAddress.text = stop.address

        if (stop.isCurrent) {
            holder.iconContainer.backgroundTintList = ContextCompat.getColorStateList(holder.itemView.context, R.color.accent_blue)
            holder.stopIcon.setImageResource(R.drawable.ic_bus)
            holder.stopIcon.imageTintList = ContextCompat.getColorStateList(holder.itemView.context, R.color.white)
            holder.arrivalStatus.setTextColor(ContextCompat.getColor(holder.itemView.context, R.color.accent_blue))
            holder.arrivalStatus.text = "BUS REACHED STOP"
        } else {
            holder.iconContainer.backgroundTintList = ContextCompat.getColorStateList(holder.itemView.context, R.color.grey_light)
            holder.stopIcon.setImageResource(R.drawable.status_indicator_green) // Default dot
            holder.stopIcon.imageTintList = ContextCompat.getColorStateList(holder.itemView.context, R.color.text_secondary)
            holder.arrivalStatus.setTextColor(ContextCompat.getColor(holder.itemView.context, R.color.text_secondary))
        }
    }

    override fun getItemCount() = stops.size
}
