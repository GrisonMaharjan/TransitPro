package com.transitpro.nfcreader.api

import android.content.Context
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

/**
 * Retrofit client provider for handling API communication.
 */
object RetrofitClient {
    private const val BASE_URL = "http://192.168.1.70:3000/"
    private var apiService: ApiService? = null

    /**
     * Returns a configured ApiService instance.
     * It uses a singleton pattern but ensures the Auth interceptor is properly initialized
     * with the application context to access SharedPreferences.
     */
    fun getInstance(context: Context): ApiService {
        if (apiService == null) {
            val logging = HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            }

            val httpClient = OkHttpClient.Builder()
                .addInterceptor(logging)
                .addInterceptor { chain ->
                    // Always use Application Context to avoid memory leaks
                    val prefs = context.applicationContext.getSharedPreferences("TransitProSession", Context.MODE_PRIVATE)
                    val token = prefs.getString("jwt_token", "")
                    
                    val request = if (!token.isNullOrEmpty()) {
                        chain.request().newBuilder()
                            .addHeader("Authorization", "Bearer $token")
                            .build()
                    } else {
                        chain.request()
                    }
                    chain.proceed(request)
                }
                .addInterceptor { chain ->
                    val request = chain.request()
                    val response = chain.proceed(request)

                    if (response.code == 401) {
                        // Global Session Invalidation handling
                        val prefs = context.applicationContext.getSharedPreferences("TransitProSession", Context.MODE_PRIVATE)
                        prefs.edit().clear().apply()
                        
                        // We can't easily start an activity from here without a flag and context
                        // But we can clear data and let the next activity transition handle it
                        // Or use a broadcast.
                    }
                    response
                }
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .writeTimeout(30, TimeUnit.SECONDS)
                .build()

            apiService = Retrofit.Builder()
                .baseUrl(BASE_URL)
                .addConverterFactory(GsonConverterFactory.create())
                .client(httpClient)
                .build()
                .create(ApiService::class.java)
        }
        return apiService!!
    }

    /**
     * Legacy property for cases where context might not be readily available.
     * Note: This may not include Auth headers if the singleton wasn't initialized with a context first.
     */
    val instance: ApiService? get() = apiService
}
