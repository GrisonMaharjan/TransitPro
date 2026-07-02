package com.transitpro.nfcreader

import android.app.PendingIntent
import android.content.Intent
import android.content.IntentFilter
import android.nfc.NfcAdapter
import android.nfc.Tag
import android.nfc.tech.Ndef
import android.os.Build
import android.os.Bundle
import android.view.View
import android.widget.ImageButton
import android.widget.PopupMenu
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.cardview.widget.CardView
import androidx.core.content.ContextCompat
import com.transitpro.nfcreader.api.RetrofitClient
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

/**
 * Activity for managing application settings and tools.
 * Provides access to NFC writing and scanning features.
 */
class SettingsActivity : AppCompatActivity() {

    private var nfcAdapter: NfcAdapter? = null
    private var isScanningActive = false
    private lateinit var tvScanStatus: TextView
    private lateinit var btnNfcScanner: CardView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_settings)

        nfcAdapter = NfcAdapter.getDefaultAdapter(this)
        tvScanStatus = findViewById(R.id.tvScanStatus)
        btnNfcScanner = findViewById(R.id.btnNfcScanner)

        setupHeader()
        setupFooter()
        setupClickListeners()
    }

    private fun setupClickListeners() {
        findViewById<View>(R.id.btnNfcWriter).setOnClickListener {
            startActivity(Intent(this, NfcWriteActivity::class.java))
        }

        btnNfcScanner.setOnClickListener {
            toggleNfcScanning()
        }
    }

    private fun toggleNfcScanning() {
        if (nfcAdapter == null) {
            Toast.makeText(this, "NFC is not supported on this device", Toast.LENGTH_SHORT).show()
            return
        }

        if (!nfcAdapter!!.isEnabled) {
            Toast.makeText(this, "Please enable NFC in settings", Toast.LENGTH_SHORT).show()
            return
        }

        isScanningActive = !isScanningActive
        if (isScanningActive) {
            btnNfcScanner.setCardBackgroundColor(ContextCompat.getColor(this, R.color.accent_orange))
            tvScanStatus.text = "Waiting for NFC Tag..."
            Toast.makeText(this, "NFC Scanner Active: Tap a card", Toast.LENGTH_SHORT).show()
        } else {
            btnNfcScanner.setCardBackgroundColor(ContextCompat.getColor(this, R.color.accent_green))
            tvScanStatus.text = "Tap to read NFC card data"
        }
    }

    private fun setupHeader() {
        val header = findViewById<View>(R.id.topBar)
        if (header != null) {
            header.findViewById<TextView>(R.id.headerSubText2)?.text = "SETTINGS"
            header.findViewById<ImageButton>(R.id.headerMenuButton)?.setOnClickListener { view ->
                showTopMenu(view)
            }
        }
    }

    private fun setupFooter() {
        val footer = findViewById<View>(R.id.bottomNav)
        if (footer != null) {
            footer.findViewById<ImageButton>(R.id.menuSettings)?.setColorFilter(
                ContextCompat.getColor(this, R.color.accent_green)
            )
            footer.findViewById<ImageButton>(R.id.menuHome)?.setOnClickListener {
                startActivity(Intent(this, MainActivity::class.java).apply {
                    flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
                })
            }
            footer.findViewById<ImageButton>(R.id.menuHistory)?.setOnClickListener {
                startActivity(Intent(this, HistoryActivity::class.java))
            }
            footer.findViewById<ImageButton>(R.id.menuRoutes)?.setOnClickListener {
                startActivity(Intent(this, RoutesActivity::class.java))
            }
        }
    }

    private fun showTopMenu(view: View) {
        val popup = PopupMenu(this, view)
        popup.menu.add("Log Out / End Shift")
        popup.setOnMenuItemClickListener { item ->
            if (item.title == "Log Out / End Shift") {
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

                prefs.edit().clear().apply()
                val intent = Intent(this, LoginActivity::class.java)
                intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                startActivity(intent)
                finish()
            }
            true
        }
        popup.show()
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

        val intent = Intent(this, javaClass).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP)
        val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            PendingIntent.FLAG_MUTABLE
        } else {
            PendingIntent.FLAG_UPDATE_CURRENT
        }
        val pendingIntent = PendingIntent.getActivity(this, 0, intent, flags)
        val filters = arrayOf(
            IntentFilter(NfcAdapter.ACTION_NDEF_DISCOVERED),
            IntentFilter(NfcAdapter.ACTION_TECH_DISCOVERED),
            IntentFilter(NfcAdapter.ACTION_TAG_DISCOVERED)
        )
        nfcAdapter?.enableForegroundDispatch(this, pendingIntent, filters, null)
    }

    override fun onPause() {
        super.onPause()
        nfcAdapter?.disableForegroundDispatch(this)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        if (isScanningActive) {
            val tag: Tag? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                intent.getParcelableExtra(NfcAdapter.EXTRA_TAG, Tag::class.java)
            } else {
                @Suppress("DEPRECATION")
                intent.getParcelableExtra(NfcAdapter.EXTRA_TAG)
            }

            tag?.let {
                readNfcData(it)
            }
        }
    }

    private fun readNfcData(tag: Tag) {
        val cardId = tag.id.joinToString("") { String.format("%02X", it) }
        var content = "No NDEF data found"

        val ndef = Ndef.get(tag)
        if (ndef != null) {
            try {
                ndef.connect()
                val ndefMessage = ndef.ndefMessage
                if (ndefMessage != null && ndefMessage.records.isNotEmpty()) {
                    val payload = ndefMessage.records[0].payload
                    if (payload.isNotEmpty()) {
                        val langCodeLen = (payload[0].toInt() and 0x3F)
                        content = if (langCodeLen < payload.size) {
                            String(payload, langCodeLen + 1, payload.size - langCodeLen - 1)
                        } else {
                            "Unknown payload format"
                        }
                    }
                }
                ndef.close()
            } catch (e: Exception) {
                content = "Error reading NDEF: ${e.message}"
            }
        }

        showScanResult(cardId, content)
        
        // Deactivate scanning after successful read
        isScanningActive = false
        btnNfcScanner.setCardBackgroundColor(ContextCompat.getColor(this, R.color.accent_green))
        tvScanStatus.text = "Tap to read NFC card data"
    }

    private fun showScanResult(id: String, content: String) {
        AlertDialog.Builder(this)
            .setTitle("NFC Card Scanned")
            .setMessage("Card ID: $id\n\nContent: $content")
            .setPositiveButton("OK", null)
            .show()
    }
}
