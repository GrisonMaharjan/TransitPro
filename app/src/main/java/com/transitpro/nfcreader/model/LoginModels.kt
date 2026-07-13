package com.transitpro.nfcreader.model

import com.google.gson.annotations.SerializedName

data class LoginRequest(
    @SerializedName("busNumber") val busNumber: String,
    @SerializedName("password") val password: String
)

data class LoginResponse(
    @SerializedName("message") val message: String,
    @SerializedName("token") val token: String?,
    @SerializedName("user") val user: UserInfo?
)

data class User(
    @SerializedName("busNumber") val busNumber: String,
    @SerializedName("vehicleId") val vehicleId: String?,
    @SerializedName("depotLocation") val depotLocation: String?,
    @SerializedName("assignedRoute") val assignedRoute: RouteInfo?
)

data class RouteInfo(
    @SerializedName("name") val name: String,
    @SerializedName("stops") val stops: List<StopDetail>
)

data class StopDetail(
    @SerializedName("name") val name: String,
    @SerializedName("latitude") val latitude: Double,
    @SerializedName("longitude") val longitude: Double,
    @SerializedName("order") val order: Int
)

// Renaming for clarity if needed, or keeping it consistent with backend
typealias UserInfo = User

data class TapRequest(
    val passengerId: String,
    val stop: String,
    val timestamp: Long,
    val busId: String,
    val latitude: Double? = null,
    val longitude: Double? = null
)

data class TapResponse(
    val success: Boolean,
    val type: String?,
    val message: String?,
    val passengerId: String?,
    val origin: String? = null,
    val destination: String? = null,
    val fare: Int? = null,
    val duration: Int? = null
)

data class TapLog(
    val passengerId: String,
    val stop: String,
    val type: String,
    val timestamp: String,
    val fare: Double?
)
