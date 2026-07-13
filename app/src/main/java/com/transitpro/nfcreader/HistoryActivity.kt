package com.transitpro.nfcreader

import android.content.Intent
import android.graphics.Paint
import android.graphics.pdf.PdfDocument
import android.net.Uri
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.PopupMenu
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.gson.Gson
import com.transitpro.nfcreader.api.RetrofitClient
import com.transitpro.nfcreader.model.RouteInfo
import com.transitpro.nfcreader.model.TapLog
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.io.IOException
import java.text.SimpleDateFormat
import java.util.*

class HistoryActivity : AppCompatActivity() {

    private var transactions = mutableListOf<Transaction>()

    private val createFileLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode == RESULT_OK) {
            result.data?.data?.let { uri -> generatePdf(uri) }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_history)

        val header = findViewById<View>(R.id.historyTopBar)
        header.findViewById<TextView>(R.id.headerSubText2).text = "HISTORY"
        header.findViewById<ImageButton>(R.id.headerMenuButton).setOnClickListener { view -> showTopMenu(view) }

        updateDailyHeader()
        setupRecyclerView()
        fetchHistory()
        setupFooter()

        findViewById<ImageButton>(R.id.downloadButton).setOnClickListener { startPdfCreation() }
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
    }

    private fun setupRecyclerView() {
        val recyclerView = findViewById<RecyclerView>(R.id.historyRecyclerView)
        recyclerView.layoutManager = LinearLayoutManager(this)
        recyclerView.adapter = HistoryAdapter(transactions)
    }

    private fun fetchHistory() {
        // Using getInstance(this) ensures the JWT token is sent in the header
        RetrofitClient.getInstance(this).getHistory().enqueue(object : Callback<List<TapLog>> {
            override fun onResponse(call: Call<List<TapLog>>, response: Response<List<TapLog>>) {
                if (response.isSuccessful) {
                    val logs = response.body() ?: emptyList()
                    transactions.clear()
                    logs.forEach { log ->
                        val date = try {
                            val sdf = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US)
                            sdf.timeZone = TimeZone.getTimeZone("UTC")
                            sdf.parse(log.timestamp)
                        } catch (e: Exception) { Date() }
                        
                        val displayTime = SimpleDateFormat("hh:mm:ss a", Locale.US).format(date ?: Date())
                        transactions.add(Transaction(displayTime, log.passengerId, log.fare ?: 0.0, log.type == "TAP_OUT" || log.type == "TAP_IN"))
                    }
                    findViewById<RecyclerView>(R.id.historyRecyclerView).adapter?.notifyDataSetChanged()
                    updateStats(transactions)
                }
            }
            override fun onFailure(call: Call<List<TapLog>>, t: Throwable) {
                Toast.makeText(this@HistoryActivity, "Failed to load history", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun updateStats(transactions: List<Transaction>) {
        var totalAmount = 0.0
        var successCount = 0
        var failCount = 0
        transactions.forEach {
            if (it.isSuccess) { totalAmount += it.amount; successCount++ } else { failCount++ }
        }
        val totalTx = transactions.size
        val successRate = if (totalTx > 0) (successCount.toDouble() / totalTx * 100).toInt() else 0
        
        findViewById<TextView>(R.id.totalAmountText).text = if (totalAmount < 1000) String.format(Locale.US, "Rs. %.0f", totalAmount) else String.format(Locale.US, "Rs. %.1fk", totalAmount / 1000)
        findViewById<TextView>(R.id.successRateText).text = "$successRate%"
        findViewById<TextView>(R.id.failCountText).text = failCount.toString()
    }

    private fun showTopMenu(view: View) {
        val popup = PopupMenu(this, view)
        popup.menu.add("Log Out / End Shift")
        popup.setOnMenuItemClickListener { item ->
            if (item.title == "Log Out / End Shift") {
                val intent = Intent(this, LoginActivity::class.java)
                intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                startActivity(intent)
                finish()
            }
            true
        }
        popup.show()
    }

    private fun updateDailyHeader() {
        val sdf = SimpleDateFormat("EEEE, MMM dd, yyyy", Locale.getDefault())
        findViewById<TextView>(R.id.shiftLogsTitle).text = "Shift Logs - ${sdf.format(Date())}"

        val prefs = getSharedPreferences("TransitProSession", MODE_PRIVATE)
        val busNumber = prefs.getString("bus_number", "0000")
        val routeJson = prefs.getString("assigned_route_json", "")
        
        var routeName = "Standard Route"
        if (!routeJson.isNullOrEmpty()) {
            try {
                val routeInfo = Gson().fromJson(routeJson, RouteInfo::class.java)
                routeName = routeInfo.name
            } catch (e: Exception) {}
        }

        findViewById<TextView>(R.id.shiftLogsSubtitle).text = "Bus $busNumber • $routeName"
    }

    private fun startPdfCreation() {
        val intent = Intent(Intent.ACTION_CREATE_DOCUMENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            type = "application/pdf"
            putExtra(Intent.EXTRA_TITLE, "Trip_History_${System.currentTimeMillis()}.pdf")
        }
        createFileLauncher.launch(intent)
    }

    private fun generatePdf(uri: Uri) {
        val pdfDocument = PdfDocument()
        val paint = Paint()
        val titlePaint = Paint().apply { textSize = 18f; isFakeBoldText = true }
        val pageInfo = PdfDocument.PageInfo.Builder(595, 842, 1).create()
        var page = pdfDocument.startPage(pageInfo)
        var canvas = page.canvas

        canvas.drawText("Transit Pro - Trip History", 40f, 50f, titlePaint)
        canvas.drawText("Date: ${SimpleDateFormat("EEEE, MMM dd, yyyy", Locale.getDefault()).format(Date())}", 40f, 75f, Paint().apply { textSize = 12f })

        var y = 110f
        canvas.drawText("Time", 40f, y, titlePaint); canvas.drawText("Passenger ID", 150f, y, titlePaint); canvas.drawText("Amount", 350f, y, titlePaint); canvas.drawText("Status", 450f, y, titlePaint)
        y += 30f
        
        transactions.forEach {
            if (y > 800) { pdfDocument.finishPage(page); page = pdfDocument.startPage(pageInfo); canvas = page.canvas; y = 50f }
            canvas.drawText(it.time, 40f, y, paint)
            canvas.drawText("ID: **** ${it.passengerId}", 150f, y, paint)
            canvas.drawText(String.format(Locale.US, "Rs. %.2f", it.amount), 350f, y, paint)
            canvas.drawText(if (it.isSuccess) "Success" else "Failed", 450f, y, paint)
            y += 25f
        }
        pdfDocument.finishPage(page)
        try { contentResolver.openOutputStream(uri)?.use { pdfDocument.writeTo(it) }; Toast.makeText(this, "PDF saved", Toast.LENGTH_SHORT).show() } catch (e: Exception) { e.printStackTrace() } finally { pdfDocument.close() }
    }

    private fun setupFooter() {
        val footer = findViewById<View>(R.id.bottomNav)
        footer.findViewById<ImageButton>(R.id.menuHistory).setColorFilter(ContextCompat.getColor(this, R.color.accent_green))
        footer.findViewById<ImageButton>(R.id.menuHome).setOnClickListener { finish() }
        footer.findViewById<ImageButton>(R.id.menuRoutes).setOnClickListener { startActivity(Intent(this, RoutesActivity::class.java)) }
        footer.findViewById<ImageButton>(R.id.menuSettings).setOnClickListener { startActivity(Intent(this, SettingsActivity::class.java)) }
    }
}

data class Transaction(val time: String, val passengerId: String, val amount: Double, val isSuccess: Boolean)

class HistoryAdapter(private val transactions: List<Transaction>) : RecyclerView.Adapter<HistoryAdapter.ViewHolder>() {
    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val time: TextView = view.findViewById(R.id.transactionTime); val passengerId: TextView = view.findViewById(R.id.passengerId); val amount: TextView = view.findViewById(R.id.amountText); val statusIcon: ImageView = view.findViewById(R.id.statusIcon)
    }
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) = ViewHolder(LayoutInflater.from(parent.context).inflate(R.layout.item_history, parent, false))
    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val t = transactions[position]
        holder.time.text = t.time; holder.passengerId.text = "ID: **** ${t.passengerId}"; holder.amount.text = String.format(Locale.US, "Rs. %.2f", t.amount)
        if (t.isSuccess) {
            holder.amount.setTextColor(ContextCompat.getColor(holder.itemView.context, R.color.accent_blue))
            holder.statusIcon.setImageResource(R.drawable.ic_success_circle)
        } else {
            holder.amount.setTextColor(ContextCompat.getColor(holder.itemView.context, R.color.accent_red))
            holder.statusIcon.setImageResource(R.drawable.ic_fail_circle)
        }
    }
    override fun getItemCount() = transactions.size
}
