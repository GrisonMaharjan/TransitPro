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
import java.util.*

class NfcWriteActivity : AppCompatActivity() {

    private lateinit var etNfcData: EditText
    private lateinit var tvWordCount: TextView
    private lateinit var btnUpdateNfc: Button
    private lateinit var btnCancelWrite: Button
    private lateinit var statusContainer: LinearLayout
    private var nfcAdapter: NfcAdapter? = null
    private var isWaitingForTag = false

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
                val wordCount = words.size
                tvWordCount.text = "Words: $wordCount/20"
                if (wordCount > 20) {
                    tvWordCount.setTextColor(resources.getColor(R.color.accent_red, null))
                } else {
                    tvWordCount.setTextColor(resources.getColor(R.color.text_secondary, null))
                }
            }
        })

        btnUpdateNfc.setOnClickListener {
            val text = etNfcData.text.toString().trim()
            val words = text.split(Regex("\\s+")).filter { it.isNotEmpty() }
            
            if (text.isEmpty()) {
                Toast.makeText(this, "Please enter some text", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            
            if (words.size > 20) {
                Toast.makeText(this, "Limit reached: Maximum 20 words", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            isWaitingForTag = true
            statusContainer.visibility = View.VISIBLE
            btnUpdateNfc.isEnabled = false
            etNfcData.isEnabled = false
            Toast.makeText(this, "Tap a card to update", Toast.LENGTH_SHORT).show()
        }
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
        val pendingIntent = PendingIntent.getActivity(this, 0, intent, PendingIntent.FLAG_MUTABLE)
        val filters = arrayOf(IntentFilter(NfcAdapter.ACTION_TAG_DISCOVERED))
        nfcAdapter?.enableForegroundDispatch(this, pendingIntent, filters, null)
    }

    override fun onPause() {
        super.onPause()
        nfcAdapter?.disableForegroundDispatch(this)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        if (isWaitingForTag && (intent.action == NfcAdapter.ACTION_TAG_DISCOVERED || 
            intent.action == NfcAdapter.ACTION_NDEF_DISCOVERED ||
            intent.action == NfcAdapter.ACTION_TECH_DISCOVERED)) {
            
            val tag = intent.getParcelableExtra<Tag>(NfcAdapter.EXTRA_TAG)
            if (tag != null) {
                writeToTag(tag, etNfcData.text.toString().trim())
            }
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
            
            if (ndef.maxSize < message.toByteArray().size) {
                Toast.makeText(this, "Data too large for this card", Toast.LENGTH_SHORT).show()
                ndef.close()
                resetStatus()
                return
            }

            ndef.writeNdefMessage(message)
            Toast.makeText(this, "Card updated successfully!", Toast.LENGTH_LONG).show()
            resetStatus()
            
        } catch (e: Exception) {
            Toast.makeText(this, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            e.printStackTrace()
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
    }
}
