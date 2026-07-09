package com.transitpro.nfcreader.api

import com.transitpro.nfcreader.model.LoginRequest
import com.transitpro.nfcreader.model.LoginResponse
import com.transitpro.nfcreader.model.TapRequest
import com.transitpro.nfcreader.model.TapResponse
import com.transitpro.nfcreader.model.TapLog
import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

interface ApiService {
    @POST("api/bus/login")
    fun login(@Body request: LoginRequest): Call<LoginResponse>

    @POST("api/bus/tap")
    fun sendTap(@Body request: Map<String, @JvmSuppressWildcards Any>): Call<TapResponse>

    @GET("api/bus/history")
    fun getHistory(): Call<List<TapLog>>

    @POST("api/bus/logout")
    fun logout(@retrofit2.http.Header("Authorization") authHeader: String): Call<Void>

    @POST("api/bus/tools/encrypt-nfcid")
    fun encryptNfcId(@Body request: Map<String, String>): Call<Map<String, String>>
}
