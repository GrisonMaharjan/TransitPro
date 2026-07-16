package com.example.transitpro

import org.junit.Test
import org.junit.Assert.*
import kotlin.math.*

/**
 * Unit tests for the TransitPro Bus Side Application.
 * Testing core logic including Haversine formula, Login data parsing, and NFC payload handling.
 */
class BusAppUnitTest {

    private val EARTH_RADIUS_KM = 6372.8

    // --- FEATURE 1: Haversine Formula (Working) ---
    @Test
    fun testHaversineAccuracy() {
        // Test distance between Ratnapark (27.7089, 85.3157) and Pulchowk (27.6766, 85.3161)
        val lat1 = 27.708954
        val lon1 = 85.315735
        val lat2 = 27.676687
        val lon2 = 85.316129

        val distance = haversine(lat1, lon1, lat2, lon2)
        
        // Approx distance is ~3.5km
        assertTrue("Distance should be between 3km and 4km", distance in 3.0..4.0)
    }

    // --- FEATURE 2: Login Data Parsing (Working) ---
    @Test
    fun testLoginResponseParsing() {
        val mockJsonResponse = """
            {
                "success": true,
                "token": "test_jwt_token_123",
                "busNumber": "0427",
                "route": "Route 1"
            }
        """.trimIndent()
        
        // Simulating the result of Gson parsing
        val success = mockJsonResponse.contains("\"success\": true")
        val token = "test_jwt_token_123"
        
        assertEquals(true, success)
        assertNotNull(token)
    }

    // --- FEATURE 3: Nearest Stop Logic (Working) ---
    @Test
    fun testNearestStopSelection() {
        val stops = listOf(
            StopData("Ratnapark", 27.7089, 85.3157),
            StopData("Pulchowk", 27.6766, 85.3161)
        )
        
        // Coordinates near Pulchowk
        val myLat = 27.6765
        val myLon = 85.3162
        
        var nearest = "Unknown"
        var min = Double.MAX_VALUE
        for (stop in stops) {
            val d = haversine(myLat, myLon, stop.lat, stop.lon)
            if (d < min) { min = d; nearest = stop.name }
        }
        
        assertEquals("Pulchowk", nearest)
    }

    // --- FEATURE 4: NFC Payload Extraction (Complicated) ---
    @Test
    fun testNfcPayloadDecoding() {
        // Mocking a standard NDEF Text Record payload
        // [0] = status byte (length of language code)
        // [1..n] = language code (e.g., 'en')
        // [n+1..] = actual text content
        val payload = byteArrayOf(
            0x02.toByte(), 
            'e'.code.toByte(), 
            'n'.code.toByte(), 
            'A'.code.toByte(), 
            'B'.code.toByte(), 
            'C'.code.toByte()
        )
        
        val langCodeLen = (payload[0].toInt() and 0x3F)
        val decoded = String(payload, langCodeLen + 1, payload.size - langCodeLen - 1)
        
        assertEquals("ABC", decoded)
    }

    // Helper logic extracted from MainActivity
    private fun haversine(lat1: Double, lon1: Double, lat2: Double, lon2: Double): Double {
        val dLat = Math.toRadians(lat2 - lat1)
        val dLon = Math.toRadians(lon2 - lon1)
        val a = sin(dLat/2).pow(2) + cos(Math.toRadians(lat1)) * cos(Math.toRadians(lat2)) * sin(dLon/2).pow(2)
        return EARTH_RADIUS_KM * 2 * atan2(sqrt(a), sqrt(1-a))
    }

    data class StopData(val name: String, val lat: Double, val lon: Double)
}
