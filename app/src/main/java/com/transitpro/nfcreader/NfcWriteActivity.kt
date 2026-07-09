package com.transitpro.nfcreader

import android.app.PendingIntent
import android.content.Intent
import android.content.IntentFilter
import android.nfc.NdefMessage
import android.nfc.NdefRecord
import android.nfc.NfcAdapter
import android.nfc.Tag
import android.nfc.tech.Ndef
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import com.transitpro.nfcreader.api.RetrofitClient
import org.json.JSONObject
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.util.*

/**
 * Activity for configuring passenger NFC cards with encrypted IDs.
 */
class NfcWriteActivity : AppCompatActivity() {

    private lateinit var etNfcData: EditText
    private lateinit var tvWordCount: TextView
    private lateinit var btnUpdateNfc: Button
    private lateinit var btnCancelWrite: Button
    private lateinit var statusContainer: LinearLayout
    private var nfcAdapter: NfcAdapter? = null
    private var isWaitingForTag = false
    private var dataToWrite: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_nfc_write)

        setupUI()
        setupHeader()
        nfcAdapter = NfcAdapter.getDefaultAdapter(this)
    }

    private fun setupUI() {
        etNfcData = findViewById(R.id.etNfcData)
        tvWordCount = findViewById(R.id.tvWordCount)
        btnUpdateNfc = findViewById(R.id.btnUpdateNfc)
        btnCancelWrite = findViewById(R.id.btnCancelWrite)
        statusContainer = findViewById(R.id.statusContainer)

        btnCancelWrite.setOnClickListener {
            resetStatus()
            Toast.makeText(this, "Writing cancelled", Toast.LENGTH_SHORT).show()
        }

        etNfcData.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                val words = s.toString().trim().split(Regex("\\s+")).filter { it.isNotEmpty() }
                tvWordCount.text = "Words: ${words.size}/20"
            }
        })

        btnUpdateNfc.setOnClickListener {
            val plainNfcId = etNfcData.text.toString().trim()
            
            if (plainNfcId.isEmpty()) {
                Toast.makeText(this, "Please enter a valid NFC ID", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            // Step 1: Request encryption from backend
            encryptAndPrepareWrite(plainNfcId)
        }
    }

    private fun encryptAndPrepareWrite(nfcId: String) {
        btnUpdateNfc.isEnabled = false
        etNfcData.isEnabled = false

        val request = mapOf("nfcId" to nfcId)
        RetrofitClient.getInstance(this).encryptNfcId(request).enqueue(object : Callback<Map<String, String>> {
            override fun onResponse(call: Call<Map<String, String>>, response: Response<Map<String, String>>) {
                if (response.isSuccessful) {
                    dataToWrite = response.body()?.get("encryptedId")
                    if (!dataToWrite.isNullOrEmpty()) {
                        isWaitingForTag = true
                        statusContainer.visibility = View.VISIBLE
                        Toast.makeText(this@NfcWriteActivity, "Backend encrypted successfully. Tap card to write.", Toast.LENGTH_SHORT).show()
                    } else {
                        showError("Invalid response from server")
                    }
                } else {
                    val errorMsg = response.errorBody()?.string()?.let {
                        try { JSONObject(it).getString("message") } catch (e: Exception) { null }
                    } ?: "Encryption failed: ${response.code()}"
                    showError(errorMsg)
                }
            }

            override fun onFailure(call: Call<Map<String, String>>, t: Throwable) {
                showError("Network Error: ${t.message}")
            }
        })
    }

    private fun showError(msg: String) {
        Toast.makeText(this, msg, Toast.LENGTH_LONG).show()
        resetStatus()
    }

    private fun setupHeader() {
        val header = findViewById<View>(R.id.topBar)
        if (header != null) {
            header.findViewById<TextView>(R.id.headerSubText2)?.text = "WRITER"
            header.findViewById<ImageButton>(R.id.headerMenuButton)?.apply {
                setImageResource(R.drawable.ic_home)
                setOnClickListener { finish() }
            }
        }
    }

    override fun onResume() {
        super.onResume()
        val intent = Intent(this, javaClass).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP)
        val flags = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) PendingIntent.FLAG_MUTABLE else PendingIntent.FLAG_UPDATE_CURRENT
        val pendingIntent = PendingIntent.getActivity(this, 0, intent, flags)
        val filters = arrayOf(IntentFilter(NfcAdapter.ACTION_TAG_DISCOVERED))
        nfcAdapter?.enableForegroundDispatch(this, pendingIntent, filters, null)
    }

    override fun onPause() {
        super.onPause()
        nfcAdapter?.disableForegroundDispatch(this)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        if (isWaitingForTag) {
            val tag: Tag? = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.TIRAMISU) {
                intent.getParcelableExtra(NfcAdapter.EXTRA_TAG, Tag::class.java)
            } else {
                @Suppress("DEPRECATION")
                intent.getParcelableExtra(NfcAdapter.EXTRA_TAG)
            }
            tag?.let { writeToTag(it, dataToWrite!!) }
        }
    }

    private fun writeToTag(tag: Tag, data: String) {
        val ndef = Ndef.get(tag)
        if (ndef == null) {
            Toast.makeText(this, "Tag does not support NDEF", Toast.LENGTH_SHORT).show()
            resetStatus()
            return
        }

        try {
            val record = NdefRecord.createTextRecord("en", data)
            val message = NdefMessage(arrayOf(record))
            ndef.connect()
            if (!ndef.isWritable) {
                Toast.makeText(this, "Tag is read-only", Toast.LENGTH_SHORT).show()
                ndef.close()
                resetStatus()
                return
            }
            ndef.writeNdefMessage(message)
            Toast.makeText(this, "Card configured with encrypted ID!", Toast.LENGTH_LONG).show()
            resetStatus()
        } catch (e: Exception) {
            Toast.makeText(this, "Write failed: ${e.message}", Toast.LENGTH_SHORT).show()
            resetStatus()
        } finally {
            try { ndef.close() } catch (e: Exception) {}
        }
    }

    private fun resetStatus() {
        isWaitingForTag = false
        statusContainer.visibility = View.GONE
        btnUpdateNfc.isEnabled = true
        etNfcData.isEnabled = true
        dataToWrite = null
    }
}
