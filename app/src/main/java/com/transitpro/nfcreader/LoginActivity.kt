package com.transitpro.nfcreader

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.transitpro.nfcreader.api.RetrofitClient
import com.transitpro.nfcreader.model.LoginRequest
import com.transitpro.nfcreader.model.LoginResponse
import com.google.gson.Gson
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class LoginActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Auto-login check
        val prefs = getSharedPreferences("TransitProSession", MODE_PRIVATE)
        if (!prefs.getString("jwt_token", "").isNullOrEmpty()) {
            startActivity(Intent(this, MainActivity::class.java))
            finish()
            return
        }

        setContentView(R.layout.activity_login)

        val etBusNumber = findViewById<EditText>(R.id.etBusNumber)
        val etPassword = findViewById<EditText>(R.id.etPassword)
        val btnLogin = findViewById<Button>(R.id.btnLogin)

        btnLogin.setOnClickListener {
            val busNumber = etBusNumber.text.toString().trim()
            val password = etPassword.text.toString().trim()

            if (busNumber.isNotEmpty() && password.isNotEmpty()) {
                performLogin(busNumber, password)
            } else {
                Toast.makeText(this, "Please enter all credentials", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun performLogin(busNumber: String, password: String) {
        val loginRequest = LoginRequest(busNumber, password)

        try {
            RetrofitClient.getInstance(this).login(loginRequest).enqueue(object : Callback<LoginResponse> {
                override fun onResponse(call: Call<LoginResponse>, response: Response<LoginResponse>) {
                    if (response.isSuccessful) {
                        val loginResponse = response.body()
                        
                        // Securely store session data
                        val prefs = getSharedPreferences("TransitProSession", MODE_PRIVATE)
                        val token = loginResponse?.token
                        println("Session token received: $token")
                        
                        val gson = Gson()
                        val routeJson = gson.toJson(loginResponse?.user?.assignedRoute)
                        
                        prefs.edit().apply {
                            putString("jwt_token", token)
                            putString("bus_number", loginResponse?.user?.busNumber)
                            putString("vehicle_id", loginResponse?.user?.vehicleId)
                            putString("assigned_route_json", routeJson)
                            apply()
                        }

                        Toast.makeText(this@LoginActivity, loginResponse?.message ?: "Login Successful", Toast.LENGTH_SHORT).show()
                        
                        val intent = Intent(this@LoginActivity, MainActivity::class.java)
                        startActivity(intent)
                        finish()
                    } else {
                        val errorMsg = response.errorBody()?.string() ?: "Invalid credentials"
                        Toast.makeText(this@LoginActivity, "Login failed: $errorMsg", Toast.LENGTH_LONG).show()
                    }
                }

                override fun onFailure(call: Call<LoginResponse>, t: Throwable) {
                    Toast.makeText(this@LoginActivity, "Network error: ${t.message}", Toast.LENGTH_LONG).show()
                }
            })
        } catch (e: Exception) {
            Toast.makeText(this, "Configuration error: ${e.message}", Toast.LENGTH_LONG).show()
            e.printStackTrace()
        }
    }
}
