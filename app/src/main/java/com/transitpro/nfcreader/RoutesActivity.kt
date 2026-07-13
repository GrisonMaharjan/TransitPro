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
import com.google.gson.Gson
import com.transitpro.nfcreader.model.RouteInfo
import org.json.JSONObject
import java.io.IOException
import java.util.Locale
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
        private const val ARRIVAL_THRESHOLD_METERS = 50.0
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_routes)

        setupHeader()
        setupFooter()
        displayRouteName()
        
        loadStops()
        setupRecyclerView()
        
        initLocation()

        findViewById<View>(R.id.fabRefresh).setOnClickListener {
            refreshLocation()
        }
    }

    private fun displayRouteName() {
        val tvRouteName = findViewById<TextView>(R.id.tvRouteName)
        val prefs = getSharedPreferences("TransitProSession", MODE_PRIVATE)
        val routeJson = prefs.getString("assigned_route_json", "")

        if (!routeJson.isNullOrEmpty()) {
            try {
                val routeInfo = Gson().fromJson(routeJson, RouteInfo::class.java)
                tvRouteName.text = routeInfo.name
            } catch (e: Exception) {
                tvRouteName.text = "Active Route"
            }
        } else {
            tvRouteName.text = "Standard Route"
        }
    }

    private fun refreshLocation() {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            Toast.makeText(this, "Refreshing Location...", Toast.LENGTH_SHORT).show()
            fusedLocationClient.lastLocation.addOnSuccessListener { location ->
                if (location != null) {
                    updateCurrentLocation(location)
                } else {
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
        header.findViewById<TextView>(R.id.headerSubText2).text = "ACTIVE ROUTE"
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

    private fun loadStops() {
        val prefs = getSharedPreferences("TransitProSession", MODE_PRIVATE)
        val routeJson = prefs.getString("assigned_route_json", "")

        if (!routeJson.isNullOrEmpty()) {
            try {
                val routeInfo = Gson().fromJson(routeJson, RouteInfo::class.java)
                val stops = routeInfo.stops.map { detail ->
                    RouteStop(
                        name = detail.name,
                        status = "WAITING FOR GPS...",
                        address = "${detail.name} Station Area",
                        isReached = false,
                        isNearest = false,
                        latitude = detail.latitude,
                        longitude = detail.longitude
                    )
                }
                stopsList.clear()
                stopsList.addAll(stops)
                return
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
        
        // Fallback to local JSON if no route assigned or error
        stopsList.clear()
        stopsList.addAll(loadStopsFromAssets())
    }

    private fun loadStopsFromAssets(): List<RouteStop> {
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
                        status = "WAITING FOR GPS...",
                        address = "$name Station Area",
                        isReached = false,
                        isNearest = false,
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

    @SuppressLint("NotifyDataSetChanged")
    private fun updateCurrentLocation(location: android.location.Location?) {
        if (location == null) return

        var nearestIndex = -1
        var minDistance = Double.MAX_VALUE
        val distances = DoubleArray(stopsList.size)

        for (i in stopsList.indices) {
            val stop = stopsList[i]
            val distanceKm = haversine(location.latitude, location.longitude, stop.latitude, stop.longitude)
            distances[i] = distanceKm * 1000
            if (distances[i] < minDistance) {
                minDistance = distances[i]
                nearestIndex = i
            }
        }

        var changed = false
        for (i in stopsList.indices) {
            val stop = stopsList[i]
            val distanceMeters = distances[i]
            val reached = distanceMeters <= ARRIVAL_THRESHOLD_METERS
            val nearest = (i == nearestIndex)
            
            val statusText = if (distanceMeters < 1000) {
                String.format(Locale.getDefault(), "DISTANCE: %.0fm", distanceMeters)
            } else {
                String.format(Locale.getDefault(), "DISTANCE: %.2fkm", distanceMeters / 1000)
            }

            if (stop.isReached != reached || stop.isNearest != nearest || stop.status != statusText) {
                stopsList[i] = stop.copy(isReached = reached, isNearest = nearest, status = statusText)
                changed = true
            }
        }

        if (changed) {
            adapter.notifyDataSetChanged()
        }
    }

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
        val prefs = getSharedPreferences("TransitProSession", MODE_PRIVATE)
        if (prefs.getString("jwt_token", "").isNullOrEmpty()) {
            startActivity(Intent(this, LoginActivity::class.java).apply { flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK })
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
    var isReached: Boolean,
    var isNearest: Boolean,
    val latitude: Double,
    val longitude: Double
) {
    fun copy(isReached: Boolean, isNearest: Boolean, status: String) = 
        RouteStop(name, status, address, isReached, isNearest, latitude, longitude)
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
        holder.stopAddress.text = stop.address

        if (stop.isReached) {
            holder.iconContainer.backgroundTintList = ContextCompat.getColorStateList(holder.itemView.context, R.color.accent_blue)
            holder.stopIcon.setImageResource(R.drawable.ic_bus)
            holder.stopIcon.imageTintList = ContextCompat.getColorStateList(holder.itemView.context, R.color.white)
            holder.arrivalStatus.setTextColor(ContextCompat.getColor(holder.itemView.context, R.color.accent_blue))
            holder.arrivalStatus.text = "BUS AT STOP (${stop.status})"
        } else if (stop.isNearest) {
            holder.iconContainer.backgroundTintList = ContextCompat.getColorStateList(holder.itemView.context, R.color.accent_orange)
            holder.stopIcon.setImageResource(R.drawable.ic_route)
            holder.stopIcon.imageTintList = ContextCompat.getColorStateList(holder.itemView.context, R.color.white)
            holder.arrivalStatus.setTextColor(ContextCompat.getColor(holder.itemView.context, R.color.accent_orange))
            holder.arrivalStatus.text = "NEAREST STOP (${stop.status})"
        } else {
            holder.iconContainer.backgroundTintList = ContextCompat.getColorStateList(holder.itemView.context, R.color.grey_light)
            holder.stopIcon.setImageResource(R.drawable.status_indicator_green)
            holder.stopIcon.imageTintList = ContextCompat.getColorStateList(holder.itemView.context, R.color.text_secondary)
            holder.arrivalStatus.setTextColor(ContextCompat.getColor(holder.itemView.context, R.color.text_secondary))
            holder.arrivalStatus.text = stop.status
        }
    }

    override fun getItemCount() = stops.size
}
