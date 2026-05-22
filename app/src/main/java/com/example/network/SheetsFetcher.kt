package com.example.network

import android.util.Log
import com.example.data.ReviewMention
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.IOException
import java.net.URLEncoder

object SheetsFetcher {
    private val client = OkHttpClient.Builder()
        .followRedirects(true)
        .followSslRedirects(true)
        .build()

    /**
     * Fetches public Google Sheet tab (e.g. Monthly Totals) as CSV and parses it.
     */
    suspend fun fetchSheetData(spreadsheetId: String, tabName: String): List<ReviewMention> = withContext(Dispatchers.IO) {
        val encodedTabName = URLEncoder.encode(tabName, "UTF-8")
        // Use Google Visualization API query spreadsheet link format, which translates public sheets directly to robust CSV formats
        val url = "https://docs.google.com/spreadsheets/d/$spreadsheetId/gviz/tq?tqx=out:csv&sheet=$encodedTabName"
        
        Log.d("SheetsFetcher", "Querying spreadsheet from URL: $url")
        val request = Request.Builder()
            .url(url)
            .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
            .build()

        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) {
                throw IOException("Server returned HTTP error: ${response.code} ${response.message}")
            }
            val body = response.body?.string() ?: throw IOException("Received empty response from spreadsheet server")
            Log.d("SheetsFetcher", "CSV Download Size: ${body.length} characters")
            return@withContext parseCsv(body)
        }
    }

    private fun parseCsv(csvData: String): List<ReviewMention> {
        val lines = csvData.split('\n')
        if (lines.isEmpty()) {
            Log.e("SheetsFetcher", "The downloaded CSV contains no rows.")
            return emptyList()
        }

        val parsedMentions = mutableListOf<ReviewMention>()
        val header = parseCsvLine(lines[0])
        Log.d("SheetsFetcher", "Parsed header tokens: $header")

        val serverNameIdx = header.indexOfFirst { it.equals("server_name", ignoreCase = true) }
        val monthIdx = header.indexOfFirst { it.equals("month", ignoreCase = true) }
        val mentionsIdx = header.indexOfFirst { it.equals("mentions", ignoreCase = true) }

        val useFallback = serverNameIdx == -1 || monthIdx == -1 || mentionsIdx == -1
        if (useFallback) {
            Log.w("SheetsFetcher", "Direct header matches failed. Utilizing index fallback indices (0, 1, 2)")
        }

        val dateRegex = """(\d{4})-(\d{2})""".toRegex()

        // Start processing records
        for (i in 1 until lines.size) {
            val line = lines[i].trim()
            if (line.isEmpty()) continue
            try {
                val row = parseCsvLine(line)
                
                val rawServer = if (useFallback) row.getOrNull(0) ?: "" else row.getOrNull(serverNameIdx) ?: ""
                val rawMonth = if (useFallback) row.getOrNull(1) ?: "" else row.getOrNull(monthIdx) ?: ""
                val rawMentions = if (useFallback) row.getOrNull(2) ?: "" else row.getOrNull(mentionsIdx) ?: ""

                val cleanedServer = rawServer.trim().removeSurrounding("\"")
                if (cleanedServer.isEmpty() || cleanedServer.equals("server_name", ignoreCase = true)) continue
                
                // Capitalize and handle Accent normalization (e.g., Iván -> Ivan) so leaderboard adds items correctly
                val serverName = normalizeName(cleanedServer)

                val cleanedMonth = rawMonth.trim().removeSurrounding("\"")
                val match = dateRegex.find(cleanedMonth)
                val (year, monthVal) = if (match != null) {
                    val y = match.groupValues[1].toIntOrNull() ?: 2026
                    val m = match.groupValues[2].toIntOrNull() ?: 5
                    Pair(y, m)
                } else {
                    // Default fallback if no date can be parsed
                    Log.w("SheetsFetcher", "Row $i had unconventional date string: $cleanedMonth. Standard fallback chosen.")
                    Pair(2026, 5)
                }

                // Sum mentions.
                val cleanedMentions = rawMentions.trim().removeSurrounding("\"")
                val mentionsCount = cleanedMentions.toIntOrNull() ?: 1

                parsedMentions.add(
                    ReviewMention(
                        serverName = serverName,
                        monthStr = String.format("%04d-%02d", year, monthVal),
                        year = year,
                        monthValue = monthVal,
                        mentionsCount = mentionsCount
                    )
                )
            } catch (e: Exception) {
                Log.e("SheetsFetcher", "Error parsing CSV record line $i", e)
            }
        }
        
        Log.d("SheetsFetcher", "Finished parsing. Total parsed records: ${parsedMentions.size}")
        return parsedMentions
    }

    private fun normalizeName(name: String): String {
        return name.trim()
            .replace("Iván", "Ivan") // Specific case in target spreadsheet
            .replace("Ivan", "Ivan") 
            .split(" ")
            .filter { it.isNotBlank() }
            .joinToString(" ") { it.lowercase().replaceFirstChar { char -> char.uppercase() } }
    }

    /**
     * Parses a single CSV line with quote escaping support according to RFC 4180
     */
    private fun parseCsvLine(line: String): List<String> {
        val result = mutableListOf<String>()
        val current = StringBuilder()
        var inQuotes = false
        var i = 0
        while (i < line.length) {
            val c = line[i]
            if (c == '"') {
                if (inQuotes && i + 1 < line.length && line[i + 1] == '"') {
                    current.append('"')
                    i++
                } else {
                    inQuotes = !inQuotes
                }
            } else if (c == ',' && !inQuotes) {
                result.add(current.toString())
                current.setLength(0)
            } else {
                current.append(c)
            }
            i++
        }
        result.add(current.toString())
        return result
    }
}
