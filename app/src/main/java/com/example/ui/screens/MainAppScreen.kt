package com.example.ui.screens

import android.text.format.DateFormat
import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.data.ReviewMention
import com.example.data.SyncMetadata
import com.example.ui.theme.*
import com.example.ui.viewmodel.ReviewViewModel
import java.text.SimpleDateFormat
import java.util.*

enum class NavigationTab(val label: String, val icon: ImageVector, val selectedIcon: ImageVector) {
    DASHBOARD("Leaderboard", Icons.Outlined.Leaderboard, Icons.Filled.Leaderboard),
    MONTHLY("Monthly Race", Icons.Outlined.CalendarMonth, Icons.Filled.CalendarMonth),
    YEARLY("Yearly Race", Icons.Outlined.Analytics, Icons.Filled.Analytics),
    BONUS("Bonus Winners", Icons.Outlined.WorkspacePremium, Icons.Filled.WorkspacePremium),
    SETTINGS("Settings & Sync", Icons.Outlined.SettingsInputComposite, Icons.Filled.Settings)
}

data class WaiterScore(
    val serverName: String,
    val totalMentions: Int,
    val rank: Int = 0
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainAppScreen(viewModel: ReviewViewModel) {
    var selectedTab by remember { mutableStateOf(NavigationTab.DASHBOARD) }
    val allMentions by viewModel.allMentions.collectAsStateWithLifecycle()
    val syncMetadata by viewModel.syncMetadata.collectAsStateWithLifecycle()
    val isSyncing by viewModel.isSyncing.collectAsStateWithLifecycle()
    val errorMessage by viewModel.errorMessage.collectAsStateWithLifecycle()

    val selectedMonth by viewModel.selectedMonth.collectAsStateWithLifecycle()
    val selectedYear by viewModel.selectedYear.collectAsStateWithLifecycle()

    // Dialog state for selected waiter bio / performance summary
    var selectedWaiterDetail by remember { mutableStateOf<WaiterScore?>(null) }

    Scaffold(
        modifier = Modifier
            .fillMaxSize()
            .testTag("app_scaffold"),
        bottomBar = {
            NavigationBar(
                modifier = Modifier.windowInsetsPadding(WindowInsets.navigationBars),
                containerColor = MaterialTheme.colorScheme.surface,
                tonalElevation = 8.dp
            ) {
                NavigationTab.entries.forEach { tab ->
                    val isSelected = selectedTab == tab
                    NavigationBarItem(
                        selected = isSelected,
                        onClick = { selectedTab = tab },
                        icon = {
                            Icon(
                                imageVector = if (isSelected) tab.selectedIcon else tab.icon,
                                contentDescription = tab.label
                            )
                        },
                        label = {
                            Text(
                                text = tab.label,
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                            )
                        },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = TerracottaPrimary,
                            selectedTextColor = TerracottaPrimary,
                            indicatorColor = TerracottaPrimary.copy(alpha = 0.15f)
                        )
                    )
                }
            }
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
                .padding(innerPadding)
        ) {
            // Mamazul Tulum Premium Brand Header
            BrandHeader(
                syncMetadata = syncMetadata,
                isSyncing = isSyncing,
                onSyncClick = { viewModel.syncFromSheet() }
            )

            if (errorMessage != null) {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 8.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Filled.Error,
                            contentDescription = "Error",
                            tint = MaterialTheme.colorScheme.error,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(
                            text = errorMessage ?: "",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onErrorContainer,
                            modifier = Modifier.weight(1f)
                        )
                        IconButton(onClick = { viewModel.syncFromSheet() }) {
                            Icon(
                                imageVector = Icons.Filled.Refresh,
                                contentDescription = "Retry",
                                tint = MaterialTheme.colorScheme.error
                            )
                        }
                    }
                }
            }

            AnimatedContent(
                targetState = selectedTab,
                transitionSpec = {
                    fadeIn(animationSpec = tween(220, delayMillis = 90)) togetherWith
                            fadeOut(animationSpec = tween(90))
                },
                label = "ScreenTransition",
                modifier = Modifier.weight(1f)
            ) { targetTab ->
                when (targetTab) {
                    NavigationTab.DASHBOARD -> DashboardScreen(
                        allMentions = allMentions,
                        selectedMonth = selectedMonth,
                        selectedYear = selectedYear,
                        isSyncing = isSyncing,
                        onWaiterClick = { selectedWaiterDetail = it }
                    )
                    NavigationTab.MONTHLY -> MonthlyRaceScreen(
                        viewModel = viewModel,
                        allMentions = allMentions,
                        selectedMonth = selectedMonth,
                        selectedYear = selectedYear,
                        onWaiterClick = { selectedWaiterDetail = it }
                    )
                    NavigationTab.YEARLY -> YearlyRaceScreen(
                        viewModel = viewModel,
                        allMentions = allMentions,
                        selectedYear = selectedYear,
                        onWaiterClick = { selectedWaiterDetail = it }
                    )
                    NavigationTab.BONUS -> BonusWinnersScreen(
                        allMentions = allMentions,
                        selectedMonth = selectedMonth,
                        selectedYear = selectedYear
                    )
                    NavigationTab.SETTINGS -> SettingsScreen(
                        viewModel = viewModel,
                        syncMetadata = syncMetadata,
                        isSyncing = isSyncing
                    )
                }
            }
        }
    }

    // Waiter performance biography and stats dialog
    selectedWaiterDetail?.let { score ->
        WaiterStatsDialog(
            waiterScore = score,
            allMentions = allMentions,
            onDismiss = { selectedWaiterDetail = null }
        )
    }
}

// ==========================================
// BRAND HEADER WITH HIGH-END MEXICAN VISUALS
// ==========================================
@Composable
fun BrandHeader(
    syncMetadata: SyncMetadata?,
    isSyncing: Boolean,
    onSyncClick: () -> Unit
) {
    val infiniteTransition = rememberInfiniteTransition(label = "SyncRotate")
    val rotationAngle by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(1500, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "Rotation"
    )

    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = MaterialTheme.colorScheme.surface,
        tonalElevation = 4.dp,
        shadowElevation = 4.dp
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            // Mamazul Logo Drawing
            Row(verticalAlignment = Alignment.CenterVertically) {
                MamazulSunEmblem(modifier = Modifier.size(46.dp))
                Spacer(modifier = Modifier.width(10.dp))
                Column {
                    Text(
                        text = "MAMAZUL",
                        style = MaterialTheme.typography.titleLarge,
                        fontFamily = FontFamily.Serif,
                        fontWeight = FontWeight.ExtraBold,
                        letterSpacing = 4.sp,
                        color = TerracottaPrimary
                    )
                    Text(
                        text = "T U L U M  •  R E V I E W   R A C E",
                        style = MaterialTheme.typography.labelSmall,
                        fontFamily = FontFamily.Monospace,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                        fontSize = 8.sp,
                        letterSpacing = 1.sp
                    )
                }
            }

            // Sync Status Icon Button
            IconButton(
                onClick = onSyncClick,
                enabled = !isSyncing,
                modifier = Modifier
                    .clip(CircleShape)
                    .background(
                        if (isSyncing) TerracottaPrimary.copy(alpha = 0.1f)
                        else MaterialTheme.colorScheme.secondary.copy(alpha = 0.08f)
                    )
            ) {
                Icon(
                    imageVector = Icons.Filled.Refresh,
                    contentDescription = "Sync Now",
                    tint = if (isSyncing) TerracottaPrimary else MaterialTheme.colorScheme.primary,
                    modifier = Modifier.rotate(if (isSyncing) rotationAngle else 0f)
                )
            }
        }
    }
}

/**
 * Native Canvas graphic of a geometric Aztec review sun decoration
 */
@Composable
fun MamazulSunEmblem(modifier: Modifier = Modifier) {
    Canvas(modifier = modifier) {
        val center = Offset(size.width / 2, size.height / 2)
        val radiusOuter = size.width / 2.3f
        val radiusInner = size.width / 4f

        // Draw Aztec base glow ring
        drawCircle(
            brush = Brush.radialGradient(
                colors = listOf(MayanGoldTertiary.copy(alpha = 0.4f), Color.Transparent),
                center = center,
                radius = radiusOuter * 1.3f
            ),
            center = center,
            radius = radiusOuter * 1.3f
        )

        // Draw outer ring
        drawCircle(
            color = TerracottaPrimary,
            center = center,
            radius = radiusOuter,
            style = Stroke(width = 3.dp.toPx())
        )

        // Draw inner ring
        drawCircle(
            color = AgaveGreenSecondary,
            center = center,
            radius = radiusInner,
            style = Stroke(width = 2.dp.toPx())
        )

        // Draw Aztec style geometric rays
        val raysCount = 12
        for (i in 0 until raysCount) {
            val angle = (i * 360f / raysCount) * (Math.PI / 180f)
            val rayStart = Offset(
                (center.x + Math.cos(angle) * (radiusInner + 2.dp.toPx())).toFloat(),
                (center.y + Math.sin(angle) * (radiusInner + 2.dp.toPx())).toFloat()
            )
            val rayEnd = Offset(
                (center.x + Math.cos(angle) * (radiusOuter - 2.dp.toPx())).toFloat(),
                (center.y + Math.sin(angle) * (radiusOuter - 2.dp.toPx())).toFloat()
            )
            drawLine(
                color = MayanGoldTertiary,
                start = rayStart,
                end = rayEnd,
                strokeWidth = 3.dp.toPx()
            )
        }

        // Draw core star polygon symbol
        val path = Path()
        val coreCount = 6
        for (i in 0 until coreCount) {
            val angle = (i * 360f / coreCount) * (Math.PI / 180f)
            val pointRadius = if (i % 2 == 0) radiusInner * 0.7f else radiusInner * 0.3f
            val x = (center.x + Math.cos(angle) * pointRadius).toFloat()
            val y = (center.y + Math.sin(angle) * pointRadius).toFloat()
            if (i == 0) path.moveTo(x, y) else path.lineTo(x, y)
        }
        path.close()
        drawPath(path, color = TerracottaPrimary)
    }
}

// ==========================================
// 1. DASHBOARD SCREEN: PREMIER LEADERBOARD & RETAIL PODIUM
// ==========================================
@Composable
fun DashboardScreen(
    allMentions: List<ReviewMention>,
    selectedMonth: Int,
    selectedYear: Int,
    isSyncing: Boolean,
    onWaiterClick: (WaiterScore) -> Unit
) {
    // Collect mentions for current month criteria
    val monthlyScores = remember(allMentions, selectedMonth, selectedYear) {
        allMentions.filter { it.year == selectedYear && it.monthValue == selectedMonth }
            .groupBy { it.serverName }
            .mapValues { entry -> entry.value.sumOf { it.mentionsCount } }
            .map { WaiterScore(it.key, it.value) }
            .sortedByDescending { it.totalMentions }
            .mapIndexed { idx, item -> item.copy(rank = idx + 1) }
    }

    val maxMentions = remember(monthlyScores) {
        monthlyScores.maxOfOrNull { it.totalMentions } ?: 1
    }

    if (isSyncing && monthlyScores.isEmpty()) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                CircularProgressIndicator(color = TerracottaPrimary, strokeWidth = 5.dp)
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = "Syncing with Mamazul Google Sheet...",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.7f)
                )
            }
        }
    } else if (monthlyScores.isEmpty()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
            ) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    MamazulSunEmblem(modifier = Modifier.size(100.dp))
                    Spacer(modifier = Modifier.height(20.dp))
                    Text(
                        text = "No Review Mentions Yet",
                        style = MaterialTheme.typography.headlineSmall,
                        fontFamily = FontFamily.Serif,
                        fontWeight = FontWeight.Bold,
                        color = TerracottaPrimary
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    Text(
                        text = "The review data is empty for ${getMonthName(selectedMonth)} $selectedYear. Let's run synchronization in the Settings menu or write mentions in the linked Sheet!",
                        style = MaterialTheme.typography.bodyMedium,
                        textAlign = TextAlign.Center,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                    )
                }
            }
        }
    } else {
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp),
            contentPadding = PaddingValues(vertical = 16.dp)
        ) {
            // Screen Title Section
            item {
                Text(
                    text = "${getMonthName(selectedMonth).uppercase()} REVIEW CHAMPIONS",
                    style = MaterialTheme.typography.titleMedium,
                    fontFamily = FontFamily.Serif,
                    fontWeight = FontWeight.Bold,
                    color = AgaveGreenSecondary,
                    modifier = Modifier.padding(bottom = 12.dp)
                )
            }

            // Spotlight Podium for top 1st, 2nd, and 3rd Places!
            item {
                SpotlightPodium(
                    scores = monthlyScores,
                    onWaiterClick = onWaiterClick
                )
                Spacer(modifier = Modifier.height(16.dp))
            }

            // racing bar label
            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "WAITER RACETRACK LEADERBOARD",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold,
                        color = TerracottaPrimary
                    )
                    Text(
                        text = "Mentions",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.5f)
                    )
                }
            }

            // Racer list itemized tracks
            itemsIndexed(monthlyScores) { index, item ->
                RacetrackLaneItem(
                    waiterScore = item,
                    maxMentions = maxMentions,
                    index = index,
                    onClick = { onWaiterClick(item) }
                )
            }
        }
    }
}

// Confetti Particle Canvas overlay
@Composable
fun SpotlightPodium(
    scores: List<WaiterScore>,
    onWaiterClick: (WaiterScore) -> Unit
) {
    val goldWinner = scores.getOrNull(0)
    val silverWinner = scores.getOrNull(1)
    val bronzeWinner = scores.getOrNull(2)

    val scaleTransition = rememberInfiniteTransition(label = "ConfettiGlow")
    val pulseGlow by scaleTransition.animateFloat(
        initialValue = 0.95f,
        targetValue = 1.05f,
        animationSpec = infiniteRepeatable(
            animation = tween(1800, easing = EasyInOutEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulse"
    )

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 3.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Header Trophy Announcement
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center,
                modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp)
            ) {
                Icon(
                    imageVector = Icons.Filled.WorkspacePremium,
                    contentDescription = null,
                    tint = MayanGoldTertiary,
                    modifier = Modifier.size(28.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "TOP REVIEW RACERS",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Serif,
                    letterSpacing = 1.5.sp,
                    color = TerracottaPrimary
                )
            }

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(190.dp),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.Bottom
            ) {
                // SECOND PLACE (Silver, left position)
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier
                        .weight(1f)
                        .clickable { silverWinner?.let(onWaiterClick) }
                ) {
                    if (silverWinner != null) {
                        MedalBadge(place = 2)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = silverWinner.serverName,
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = FontWeight.Bold,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                        Text(
                            text = "${silverWinner.totalMentions} Mentions",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                        )
                    } else {
                        Spacer(modifier = Modifier.size(40.dp))
                        Text(text = "-", style = MaterialTheme.typography.bodyMedium)
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    PodiumColumn(
                        height = 65.dp,
                        color = Color(0xFFC0C0C0), // Silver slate
                        label = "2nd"
                    )
                }

                // FIRST PLACE (Gold, center position)
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier
                        .weight(1.2f)
                        .clickable { goldWinner?.let(onWaiterClick) }
                ) {
                    if (goldWinner != null) {
                        AnimatedVisibility(
                            visible = true,
                            enter = scaleIn(animationSpec = spring(stiffness = Spring.StiffnessLow))
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                TrophyIconGlowing(pulseScale = pulseGlow)
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = goldWinner.serverName,
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = TerracottaPrimary,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                                Text(
                                    text = "${goldWinner.totalMentions} Mentions",
                                    style = MaterialTheme.typography.bodySmall,
                                    fontWeight = FontWeight.Bold,
                                    color = MayanGoldTertiary
                                )
                            }
                        }
                    } else {
                        Spacer(modifier = Modifier.size(50.dp))
                        Text(text = "-", style = MaterialTheme.typography.bodyMedium)
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    PodiumColumn(
                        height = 100.dp,
                        color = MayanGoldTertiary, // Aztec Gold
                        label = "1st",
                        glow = true
                    )
                }

                // THIRD PLACE (Bronze, right position)
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier
                        .weight(1f)
                        .clickable { bronzeWinner?.let(onWaiterClick) }
                ) {
                    if (bronzeWinner != null) {
                        MedalBadge(place = 3)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = bronzeWinner.serverName,
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = FontWeight.Bold,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                        Text(
                            text = "${bronzeWinner.totalMentions} Mentions",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                        )
                    } else {
                        Spacer(modifier = Modifier.size(40.dp))
                        Text(text = "-", style = MaterialTheme.typography.bodyMedium)
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    PodiumColumn(
                        height = 45.dp,
                        color = Color(0xFFCD7F32), // Bronze Terracotta
                        label = "3rd"
                    )
                }
            }
        }
    }
}

@Composable
fun PodiumColumn(
    height: Dp,
    color: Color,
    label: String,
    glow: Boolean = false
) {
    val roundedCornerShape = RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp)
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(height)
            .clip(roundedCornerShape)
            .background(
                Brush.verticalGradient(
                    colors = listOf(color, color.copy(alpha = 0.6f))
                )
            )
            .border(
                width = 1.dp,
                color = if (glow) MayanGoldTertiary else Color.Transparent,
                shape = roundedCornerShape
            ),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
                text = label,
                fontSize = 20.sp,
                fontFamily = FontFamily.Serif,
                fontWeight = FontWeight.Black,
                color = if (color == Color(0xFFC0C0C0)) Color.DarkGray else Color.White
            )
        }
    }
}

@Composable
fun TrophyIconGlowing(pulseScale: Float) {
    Box(
        modifier = Modifier
            .size(54.dp)
            .padding(4.dp),
        contentAlignment = Alignment.Center
    ) {
        // Star glow base
        Canvas(modifier = Modifier.fillMaxSize()) {
            drawCircle(
                color = MayanGoldTertiary.copy(alpha = 0.3f * pulseScale),
                radius = size.width / 2 * pulseScale
            )
        }
        Icon(
            imageVector = Icons.Filled.MilitaryTech,
            contentDescription = "Trophy Winner",
            tint = MayanGoldTertiary,
            modifier = Modifier.size(42.dp)
        )
    }
}

@Composable
fun MedalBadge(place: Int) {
    val color = if (place == 2) Color(0xFFB4B4B4) else Color(0xFFCD7F32)
    Box(
        modifier = Modifier
            .size(36.dp)
            .background(color.copy(alpha = 0.15f), shape = CircleShape)
            .border(1.5.dp, color, CircleShape),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = "$place",
            style = MaterialTheme.typography.bodyMedium,
            fontWeight = FontWeight.Bold,
            color = color
        )
    }
}

// ==========================================
// HORIZONTAL PROGRESS BAR RACETRACK ITEM
// ==========================================
@Composable
fun RacetrackLaneItem(
    waiterScore: WaiterScore,
    maxMentions: Int,
    index: Int,
    onClick: () -> Unit
) {
    var animTriggered by remember { mutableStateOf(false) }
    LaunchedEffect(key1 = waiterScore) {
        animTriggered = true
    }

    val progressFraction = waiterScore.totalMentions.toFloat() / maxMentions.coerceAtLeast(1)
    val animatedProgress by animateFloatAsState(
        targetValue = if (animTriggered) progressFraction else 0f,
        animationSpec = tween(1200, easing = FastOutSlowInEasing),
        label = "LaneProgress"
    )

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp)
            .clickable(onClick = onClick)
            .testTag("racetrack_item_${waiterScore.serverName}"),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Rank Number Bubble
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .background(
                        color = when (waiterScore.rank) {
                            1 -> MayanGoldTertiary.copy(alpha = 0.15f)
                            2 -> Color(0xFFC0C0C0).copy(alpha = 0.15f)
                            3 -> Color(0xFFCD7F32).copy(alpha = 0.15f)
                            else -> MaterialTheme.colorScheme.onSurface.copy(alpha = 0.05f)
                        },
                        shape = CircleShape
                    ),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "${waiterScore.rank}",
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Black,
                    color = when (waiterScore.rank) {
                        1 -> TerracottaPrimary
                        2 -> AgaveGreenSecondary
                        3 -> Color(0xFFCD7F32)
                        else -> MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                    }
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            // Racetrack Bar Lane
            Column(modifier = Modifier.weight(1f)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.Bottom
                ) {
                    Text(
                        text = waiterScore.serverName,
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "${waiterScore.totalMentions}",
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.ExtraBold,
                        color = TerracottaPrimary
                    )
                }

                Spacer(modifier = Modifier.height(6.dp))

                // Custom Racer Track
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(16.dp)
                        .background(
                            MaterialTheme.colorScheme.onSurface.copy(alpha = 0.06f),
                            shape = CircleShape
                        )
                ) {
                    // Runner Progress bar
                    Box(
                        modifier = Modifier
                            .fillMaxWidth(animatedProgress)
                            .fillMaxHeight()
                            .background(
                                Brush.horizontalGradient(
                                    colors = listOf(
                                        AgaveGreenSecondary,
                                        TerracottaPrimary,
                                        MayanGoldTertiary
                                    )
                                ),
                                shape = CircleShape
                            )
                    )

                    // Racing Icon indicator moving with bar
                    if (animatedProgress > 0.05f) {
                        Box(
                            modifier = Modifier
                                .align(Alignment.CenterStart)
                                .fillMaxWidth(animatedProgress)
                        ) {
                            Box(
                                modifier = Modifier
                                    .align(Alignment.CenterEnd)
                                    .offset(x = (-4).dp)
                                    .size(10.dp)
                                    .background(Color.White, shape = CircleShape)
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.dashBorder(Color.LightGray))

            Icon(
                imageVector = Icons.Filled.ChevronRight,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.3f),
                modifier = Modifier.size(20.dp)
            )
        }
    }
}

// Standard Easy Out spring interpolation helper
val EasyInOutEasing = CubicBezierEasing(0.42f, 0.0f, 0.58f, 1.0f)

// Confetti design extension
fun Modifier.dashBorder(color: Color): Modifier = this.then(
    Modifier.padding(horizontal = 4.dp).width(1.dp).fillMaxHeight()
)

// ==========================================
// 2. MONTHLY RACE SCREEN: EXPLORATION MEMORY
// ==========================================
@Composable
fun MonthlyRaceScreen(
    viewModel: ReviewViewModel,
    allMentions: List<ReviewMention>,
    selectedMonth: Int,
    selectedYear: Int,
    onWaiterClick: (WaiterScore) -> Unit
) {
    var expandedMonth by remember { mutableStateOf(false) }
    var expandedYear by remember { mutableStateOf(false) }

    // Aggregate monthly ratings
    val monthlyScores = remember(allMentions, selectedMonth, selectedYear) {
        allMentions.filter { it.year == selectedYear && it.monthValue == selectedMonth }
            .groupBy { it.serverName }
            .mapValues { entry -> entry.value.sumOf { it.mentionsCount } }
            .map { WaiterScore(it.key, it.value) }
            .sortedByDescending { it.totalMentions }
            .mapIndexed { idx, item -> item.copy(rank = idx + 1) }
    }

    val maxMentions = remember(monthlyScores) {
        monthlyScores.maxOfOrNull { it.totalMentions } ?: 1
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        // Date Selector Dropdowns
        Text(
            text = "SELECT MONTH & YEAR TO EXPLORE",
            style = MaterialTheme.typography.labelMedium,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.6f)
        )

        Spacer(modifier = Modifier.height(8.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            // Month Dropdown Box
            Box(modifier = Modifier.weight(1.3f)) {
                OutlinedButton(
                    onClick = { expandedMonth = true },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = TerracottaPrimary)
                ) {
                    Row(
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(text = getMonthName(selectedMonth), fontWeight = FontWeight.Bold)
                        Icon(imageVector = Icons.Filled.ArrowDropDown, contentDescription = null)
                    }
                }
                DropdownMenu(
                    expanded = expandedMonth,
                    onDismissRequest = { expandedMonth = false }
                ) {
                    (1..12).forEach { m ->
                        DropdownMenuItem(
                            text = { Text(getMonthName(m)) },
                            onClick = {
                                viewModel.updateSelectedMonth(m)
                                expandedMonth = false
                            }
                        )
                    }
                }
            }

            // Year Dropdown Box
            Box(modifier = Modifier.weight(1f)) {
                OutlinedButton(
                    onClick = { expandedYear = true },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = TerracottaPrimary)
                ) {
                    Row(
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(text = "$selectedYear", fontWeight = FontWeight.Bold)
                        Icon(imageVector = Icons.Filled.ArrowDropDown, contentDescription = null)
                    }
                }
                DropdownMenu(
                    expanded = expandedYear,
                    onDismissRequest = { expandedYear = false }
                ) {
                    listOf(2025, 2026, 2027, 2028).forEach { y ->
                        DropdownMenuItem(
                            text = { Text("$y") },
                            onClick = {
                                viewModel.updateSelectedYear(y)
                                expandedYear = false
                            }
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        if (monthlyScores.isEmpty()) {
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth(),
                contentAlignment = Alignment.Center
            ) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Column(
                        modifier = Modifier.padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            imageVector = Icons.Outlined.HourglassEmpty,
                            contentDescription = null,
                            tint = TerracottaPrimary,
                            modifier = Modifier.size(48.dp)
                        )
                        Spacer(modifier = Modifier.height(10.dp))
                        Text(
                            text = "No race history exists for this date.",
                            style = MaterialTheme.typography.bodyMedium,
                            textAlign = TextAlign.Center
                        )
                    }
                }
            }
        } else {
            // Confirmed winner celebrating crown
            val champion = monthlyScores.first()
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = TerracottaPrimary),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text(
                            text = "MONTH CHAMPION",
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.ExtraBold,
                            color = MayanGoldTertiary,
                            fontSize = 11.sp,
                            letterSpacing = 1.5.sp
                        )
                        Text(
                            text = champion.serverName,
                            style = MaterialTheme.typography.headlineSmall,
                            fontFamily = FontFamily.Serif,
                            fontWeight = FontWeight.ExtraBold,
                            color = Color.White
                        )
                        Text(
                            text = "${champion.totalMentions} Google review mentions",
                            style = MaterialTheme.typography.bodySmall,
                            color = Color.White.copy(alpha = 0.9f)
                        )
                    }

                    Box(
                        modifier = Modifier
                            .size(60.dp)
                            .background(Color.White.copy(alpha = 0.15f), shape = CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Filled.EmojiEvents,
                            contentDescription = "Gold Cup",
                            tint = MayanGoldTertiary,
                            modifier = Modifier.size(36.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text = "RACE POSITIONS",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold,
                color = AgaveGreenSecondary,
                modifier = Modifier.padding(bottom = 6.dp)
            )

            // Racetrack lists
            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                itemsIndexed(monthlyScores) { index, score ->
                    RacetrackLaneItem(
                        waiterScore = score,
                        maxMentions = maxMentions,
                        index = index,
                        onClick = { onWaiterClick(score) }
                    )
                }
            }
        }
    }
}

// ==========================================
// 3. YEARLY RACE SCREEN: DEEP ANNUAL ANALYTICS
// ==========================================
@Composable
fun YearlyRaceScreen(
    viewModel: ReviewViewModel,
    allMentions: List<ReviewMention>,
    selectedYear: Int,
    onWaiterClick: (WaiterScore) -> Unit
) {
    var expandedYear by remember { mutableStateOf(false) }

    // Aggregate values for the filtered year
    val yearlyScores = remember(allMentions, selectedYear) {
        allMentions.filter { it.year == selectedYear }
            .groupBy { it.serverName }
            .mapValues { entry -> entry.value.sumOf { it.mentionsCount } }
            .map { WaiterScore(it.key, it.value) }
            .sortedByDescending { it.totalMentions }
            .mapIndexed { idx, item -> item.copy(rank = idx + 1) }
    }

    val maxYearlyMentions = remember(yearlyScores) {
        yearlyScores.maxOfOrNull { it.totalMentions } ?: 1
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "$selectedYear ANNUAL CHAMPIONSHIP",
                style = MaterialTheme.typography.titleMedium,
                fontFamily = FontFamily.Serif,
                fontWeight = FontWeight.Bold,
                color = AgaveGreenSecondary
            )

            // Year selector
            Box {
                OutlinedButton(
                    onClick = { expandedYear = true },
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = TerracottaPrimary),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp)
                ) {
                    Text(text = "$selectedYear", fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.width(6.dp))
                    Icon(imageVector = Icons.Filled.ArrowDropDown, contentDescription = null, modifier = Modifier.size(16.dp))
                }
                DropdownMenu(
                    expanded = expandedYear,
                    onDismissRequest = { expandedYear = false }
                ) {
                    listOf(2025, 2026, 2027, 2028).forEach { y ->
                        DropdownMenuItem(
                            text = { Text("$y") },
                            onClick = {
                                viewModel.updateSelectedYear(y)
                                expandedYear = false
                            }
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        if (yearlyScores.isEmpty()) {
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth(),
                contentAlignment = Alignment.Center
            ) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Column(
                        modifier = Modifier.padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            imageVector = Icons.Outlined.BarChart,
                            contentDescription = null,
                            tint = TerracottaPrimary,
                            modifier = Modifier.size(48.dp)
                        )
                        Spacer(modifier = Modifier.height(10.dp))
                        Text(
                            text = "No cumulative year data for $selectedYear.",
                            style = MaterialTheme.typography.bodyMedium,
                            textAlign = TextAlign.Center
                        )
                    }
                }
            }
        } else {
            // Gold Medal Champion banner
            val yearlyChamp = yearlyScores.first()
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = BorderStroke(2.dp, MayanGoldTertiary),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(50.dp)
                                .background(MayanGoldTertiary.copy(alpha = 0.15f), shape = CircleShape)
                                .border(1.5.dp, MayanGoldTertiary, CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Filled.MilitaryTech,
                                contentDescription = "Trophy Cup",
                                tint = MayanGoldTertiary,
                                modifier = Modifier.size(34.dp)
                            )
                        }

                        Spacer(modifier = Modifier.width(16.dp))

                        Column {
                            Text(
                                text = "YEARLY GRAND CHAMPION",
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.Black,
                                color = TerracottaPrimary,
                                letterSpacing = 1.2.sp
                            )
                            Text(
                                text = yearlyChamp.serverName,
                                style = MaterialTheme.typography.titleLarge,
                                fontFamily = FontFamily.Serif,
                                fontWeight = FontWeight.ExtraBold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = "${yearlyChamp.totalMentions} total mentions this year!",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "YEARLY PERFORMANCE COMPARISON PROFILE",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold,
                color = TerracottaPrimary,
                modifier = Modifier.padding(bottom = 8.dp)
            )

            // Graphical comparison chart comparing all waiters
            YearlyBarChart(scores = yearlyScores, maxVal = maxYearlyMentions)

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "ACCUMULATED TEAM SUMMARY RESULTS",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold,
                color = AgaveGreenSecondary,
                modifier = Modifier.padding(bottom = 6.dp)
            )

            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                itemsIndexed(yearlyScores) { index, score ->
                    RacetrackLaneItem(
                        waiterScore = score,
                        maxMentions = maxYearlyMentions,
                        index = index,
                        onClick = { onWaiterClick(score) }
                    )
                }
            }
        }
    }
}

/**
 * Clean native Canvas vertical comparisons bar chart
 */
@Composable
fun YearlyBarChart(scores: List<WaiterScore>, maxVal: Int) {
    val displayScores = scores.take(5) // Limit chart to top 5 racers for visibility
    if (displayScores.isEmpty()) return

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .height(180.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.onSurface.copy(alpha = 0.08f))
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
        ) {
            Text(
                text = "Top 5 Racer Volume Rates",
                style = MaterialTheme.typography.labelSmall,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
            )

            Row(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .padding(top = 12.dp),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.Bottom
            ) {
                displayScores.forEach { score ->
                    val barHeightFraction = score.totalMentions.toFloat() / maxVal.coerceAtLeast(1)
                    val animatedHeight by animateFloatAsState(
                        targetValue = barHeightFraction,
                        animationSpec = tween(1000, easing = FastOutSlowInEasing),
                        label = "BarHeight"
                    )

                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.weight(1f)
                    ) {
                        // score number value
                        Text(
                            text = "${score.totalMentions}",
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Bold,
                            color = TerracottaPrimary
                        )

                        Spacer(modifier = Modifier.height(4.dp))

                        // bar box
                        Box(
                            modifier = Modifier
                                .width(22.dp)
                                .fillMaxHeight(0.75f * animatedHeight.coerceIn(0.01f, 1.0f))
                                .background(
                                    brush = Brush.verticalGradient(
                                        colors = listOf(
                                            TerracottaPrimary,
                                            MayanGoldTertiary
                                        )
                                    ),
                                    shape = RoundedCornerShape(topStart = 6.dp, topEnd = 6.dp)
                                )
                        )

                        Spacer(modifier = Modifier.height(6.dp))

                        // name truncated
                        Text(
                            text = score.serverName,
                            style = MaterialTheme.typography.labelSmall,
                            maxLines = 1,
                            fontWeight = FontWeight.Bold,
                            overflow = TextOverflow.Ellipsis,
                            modifier = Modifier.padding(horizontal = 2.dp)
                        )
                    }
                }
            }
        }
    }
}

// ==========================================
// 4. BONUS SCREEN: HIGH-END CHAMPIONSHIP CERTIFICATION
// ==========================================
@Composable
fun BonusWinnersScreen(
    allMentions: List<ReviewMention>,
    selectedMonth: Int,
    selectedYear: Int
) {
    // Current Monthly calculations
    val monthlyScores = remember(allMentions, selectedMonth, selectedYear) {
        allMentions.filter { it.year == selectedYear && it.monthValue == selectedMonth }
            .groupBy { it.serverName }
            .mapValues { entry -> entry.value.sumOf { it.mentionsCount } }
            .map { WaiterScore(it.key, it.value) }
            .sortedByDescending { it.totalMentions }
    }

    // Yearly calculations
    val yearlyScores = remember(allMentions, selectedYear) {
        allMentions.filter { it.year == selectedYear }
            .groupBy { it.serverName }
            .mapValues { entry -> entry.value.sumOf { it.mentionsCount } }
            .map { WaiterScore(it.key, it.value) }
            .sortedByDescending { it.totalMentions }
    }

    val monthlyWinner = monthlyScores.firstOrNull()
    val yearlyWinner = yearlyScores.firstOrNull()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(
            text = "MAMAZUL TULUM BONUS WINNERS",
            style = MaterialTheme.typography.titleMedium,
            fontFamily = FontFamily.Serif,
            fontWeight = FontWeight.Bold,
            color = AgaveGreenSecondary
        )

        // MONTHLY BONUS WINNER
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
            border = BorderStroke(1.5.dp, TerracottaPrimary.copy(alpha = 0.3f))
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .background(TerracottaPrimary.copy(alpha = 0.1f), shape = CircleShape)
                            .padding(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = "MONTHLY BONUS WINNER",
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Black,
                            color = TerracottaPrimary,
                            letterSpacing = 1.sp
                        )
                    }

                    Text(
                        text = "${getMonthName(selectedMonth).uppercase()} $selectedYear",
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                if (monthlyWinner != null) {
                    // Winner portrait graphics
                    Box(
                        modifier = Modifier
                            .size(68.dp)
                            .background(MayanGoldTertiary.copy(alpha = 0.15f), shape = CircleShape)
                            .border(1.5.dp, MayanGoldTertiary, CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Filled.MilitaryTech,
                            contentDescription = "Medal",
                            tint = MayanGoldTertiary,
                            modifier = Modifier.size(46.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Text(
                        text = monthlyWinner.serverName,
                        style = MaterialTheme.typography.headlineSmall,
                        fontFamily = FontFamily.Serif,
                        fontWeight = FontWeight.ExtraBold,
                        color = MaterialTheme.colorScheme.onSurface
                    )

                    Spacer(modifier = Modifier.height(2.dp))

                    Text(
                        text = "Total Mentions: ${monthlyWinner.totalMentions}",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Black,
                        color = AgaveGreenSecondary
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    Text(
                        text = "🏆 Monthly cash bonus and recognition certificate awarded to ${monthlyWinner.serverName} for obtaining the highest number of mentions this month! Keep driving our guest satisfaction!",
                        style = MaterialTheme.typography.bodyMedium,
                        textAlign = TextAlign.Center,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                        lineHeight = 20.sp
                    )
                } else {
                    Text(
                        text = "No race data registered for this current monthly filter window.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                    )
                }
            }
        }

        // YEAR-END BONUS WINNER
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
            border = BorderStroke(2.dp, MayanGoldTertiary)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .background(MayanDarkGold.copy(alpha = 0.15f), shape = CircleShape)
                            .padding(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = "YEAR-END GRAND BONUS",
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Black,
                            color = TerracottaPrimary,
                            letterSpacing = 1.sp
                        )
                    }

                    Text(
                        text = "ANNUAL CHAMPION",
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.Bold,
                        color = MayanGoldTertiary
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                if (yearlyWinner != null) {
                    // Huge Champion graphics
                    Box(
                        modifier = Modifier
                            .size(80.dp)
                            .background(TerracottaPrimary.copy(alpha = 0.1f), shape = CircleShape)
                            .border(2.dp, TerracottaPrimary, CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Filled.EmojiEvents,
                            contentDescription = "Big Trophy Winner",
                            tint = MayanGoldTertiary,
                            modifier = Modifier.size(52.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Text(
                        text = yearlyWinner.serverName,
                        style = MaterialTheme.typography.headlineLarge,
                        fontFamily = FontFamily.Serif,
                        fontWeight = FontWeight.Black,
                        color = TerracottaPrimary
                    )

                    Spacer(modifier = Modifier.height(2.dp))

                    Text(
                        text = "${yearlyWinner.totalMentions} Accumulated Reviews",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.ExtraBold,
                        color = AgaveGreenSecondary
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    Text(
                        text = "⭐️ Congratulations! The yearly bonus champion represents the pinnacle of hospitality service at Mamazul Tulum. Awarded with custom travel bonuses and featured permanent recognition in our main hall!",
                        style = MaterialTheme.typography.bodyMedium,
                        textAlign = TextAlign.Center,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                        lineHeight = 20.sp
                    )
                } else {
                    Text(
                        text = "Annual scores are empty. Accumulate mentions by loading reviews.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
                    )
                }
            }
        }
    }
}

// ==========================================
// 5. SETTINGS SCREEN: SHEETS API SYNCHRONIST MODE
// ==========================================
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    viewModel: ReviewViewModel,
    syncMetadata: SyncMetadata?,
    isSyncing: Boolean
) {
    val currentSheetId by viewModel.spreadsheetId.collectAsStateWithLifecycle()
    val currentTabName by viewModel.sheetName.collectAsStateWithLifecycle()

    var sheetIdInput by remember { mutableStateOf(currentSheetId) }
    var tabNameInput by remember { mutableStateOf(currentTabName) }

    // Sync input fields if changes occur in properties
    LaunchedEffect(currentSheetId, currentTabName) {
        sheetIdInput = currentSheetId
        tabNameInput = currentTabName
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(
            text = "GOOGLE SPREADSHEET SETTINGS",
            style = MaterialTheme.typography.titleMedium,
            fontFamily = FontFamily.Serif,
            fontWeight = FontWeight.Bold,
            color = AgaveGreenSecondary
        )

        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                OutlinedTextField(
                    value = sheetIdInput,
                    onValueChange = { sheetIdInput = it },
                    label = { Text("Spreadsheet Key (ID)") },
                    modifier = Modifier.fillMaxWidth()
                        .testTag("spreadsheet_id_input"),
                    shape = RoundedCornerShape(10.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = TerracottaPrimary,
                        focusedLabelColor = TerracottaPrimary
                    )
                )

                OutlinedTextField(
                    value = tabNameInput,
                    onValueChange = { tabNameInput = it },
                    label = { Text("Tab Worksheet Name") },
                    modifier = Modifier.fillMaxWidth()
                        .testTag("worksheet_id_input"),
                    shape = RoundedCornerShape(10.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = TerracottaPrimary,
                        focusedLabelColor = TerracottaPrimary
                    )
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    ElevatedButton(
                        onClick = {
                            viewModel.updateSettings(sheetIdInput.trim(), tabNameInput.trim())
                            viewModel.syncFromSheet()
                        },
                        colors = ButtonDefaults.elevatedButtonColors(
                            containerColor = TerracottaPrimary,
                            contentColor = Color.White
                        ),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.weight(1.3f)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            if (isSyncing) {
                                CircularProgressIndicator(color = Color.White, modifier = Modifier.size(16.dp), strokeWidth = 2.dp)
                            } else {
                                Icon(imageVector = Icons.Filled.Save, contentDescription = null, modifier = Modifier.size(16.dp))
                            }
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Save & Sync", fontWeight = FontWeight.Bold)
                        }
                    }

                    OutlinedButton(
                        onClick = {
                            viewModel.resetSettings()
                        },
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = TerracottaPrimary),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Reset Default")
                    }
                }
            }
        }

        // SYNC STATUS REPORT
        Text(
            text = "SYNCHRONIZATION METRIC PROFILE",
            style = MaterialTheme.typography.titleSmall,
            fontWeight = FontWeight.Bold,
            color = TerracottaPrimary
        )

        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(
                containerColor = if (syncMetadata?.lastSyncSuccess == true) {
                    AgaveGreenSecondary.copy(alpha = 0.05f)
                } else {
                    TerracottaPrimary.copy(alpha = 0.05f)
                }
            ),
            border = BorderStroke(
                1.dp,
                if (syncMetadata?.lastSyncSuccess == true) AgaveGreenSecondary.copy(alpha = 0.2f) else TerracottaPrimary.copy(alpha = 0.2f)
            )
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(text = "Sync Health:", fontWeight = FontWeight.Bold)
                    Box(
                        modifier = Modifier
                            .background(
                                color = if (syncMetadata?.lastSyncSuccess == true) AgaveGreenSecondary else TerracottaPrimary,
                                shape = CircleShape
                            )
                            .padding(horizontal = 12.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = if (syncMetadata?.lastSyncSuccess == true) "EXCELLENT" else "UNSYNCED",
                            color = Color.White,
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.ExtraBold
                        )
                    }
                }

                Spacer(modifier = Modifier.height(2.dp))

                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text(text = "Last Sync Completed:", style = MaterialTheme.typography.bodyMedium)
                    Text(
                        text = if (syncMetadata?.lastSyncTime != null && syncMetadata.lastSyncTime > 0L) {
                            formatDateString(syncMetadata.lastSyncTime)
                        } else {
                            "Never Synchronized"
                        },
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Bold
                    )
                }

                Text(
                    text = syncMetadata?.lastSyncMessage ?: "Sync configuration ready. Fetch data to initialize leaderboard tables.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                    modifier = Modifier.padding(top = 4.dp)
                )
            }
        }

        // NON-TECHNICAL USER SHEET ONBOARDING GUIDE
        Text(
            text = "HOW TO LINK MY OWN SHEET",
            style = MaterialTheme.typography.titleSmall,
            fontWeight = FontWeight.Bold,
            color = TerracottaPrimary
        )

        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Text(
                    text = "Configure Spreadsheet in 3 Simple Steps:",
                    fontWeight = FontWeight.Bold,
                    color = AgaveGreenSecondary
                )

                Text(
                    text = "1. Open your restaurant's reviews spreadsheet in Google Sheets.\n" +
                            "2. Click the yellow 'Share' button in the upper-right corner. Change access to 'Anyone with the link can view'.\n" +
                            "3. Copy the long alphanumerical ID string from your sheet URL from the address bar (it's the characters between '/d/' and '/edit') and paste it into the 'Spreadsheet ID' field above. Maintain tab name 'Monthly Totals'.",
                    style = MaterialTheme.typography.bodyMedium,
                    lineHeight = 22.sp,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.75f)
                )
            }
        }
    }
}

// Dialog Composable
@Composable
fun WaiterStatsDialog(
    waiterScore: WaiterScore,
    allMentions: List<ReviewMention>,
    onDismiss: () -> Unit
) {
    val waiterHistory = remember(allMentions, waiterScore.serverName) {
        allMentions.filter { it.serverName.equals(waiterScore.serverName, ignoreCase = true) }
            .sortedWith(compareBy<ReviewMention> { it.year }.thenBy { it.monthValue })
    }

    val annualTotal = remember(waiterHistory) {
        waiterHistory.sumOf { it.mentionsCount }
    }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Trophy icon
                Box(
                    modifier = Modifier
                        .size(60.dp)
                        .background(TerracottaPrimary.copy(alpha = 0.1f), shape = CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Filled.Person,
                        contentDescription = null,
                        tint = TerracottaPrimary,
                        modifier = Modifier.size(34.dp)
                    )
                }

                Text(
                    text = waiterScore.serverName.uppercase(),
                    style = MaterialTheme.typography.headlineMedium,
                    fontFamily = FontFamily.Serif,
                    fontWeight = FontWeight.Black,
                    color = TerracottaPrimary,
                    textAlign = TextAlign.Center
                )

                Row(
                    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(text = "CURRENT MONTH", style = MaterialTheme.typography.labelSmall, color = Color.Gray)
                        Text(text = "${waiterScore.totalMentions}", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = AgaveGreenSecondary)
                    }
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(text = "ANNUAL TOTAL", style = MaterialTheme.typography.labelSmall, color = Color.Gray)
                        Text(text = "$annualTotal", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = MayanGoldTertiary)
                    }
                }

                Divider(color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.08f))

                Text(
                    text = "Historical Racetrack Progress",
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    color = AgaveGreenSecondary,
                    modifier = Modifier.align(Alignment.Start)
                )

                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(max = 160.dp)
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    if (waiterHistory.isEmpty()) {
                        Text(text = "No history records cached.", style = MaterialTheme.typography.bodyMedium, color = Color.Gray)
                    } else {
                        waiterHistory.forEach { mention ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .background(
                                        MaterialTheme.colorScheme.onSurface.copy(alpha = 0.03f),
                                        shape = RoundedCornerShape(8.dp)
                                    )
                                    .padding(horizontal = 12.dp, vertical = 6.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "${getMonthName(mention.monthValue)} ${mention.year}",
                                    style = MaterialTheme.typography.bodyMedium,
                                    fontWeight = FontWeight.Bold
                                )
                                Text(
                                    text = "${mention.mentionsCount} Mentions",
                                    style = MaterialTheme.typography.bodyMedium,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = TerracottaPrimary
                                )
                            }
                        }
                    }
                }

                ElevatedButton(
                    onClick = onDismiss,
                    colors = ButtonDefaults.elevatedButtonColors(
                        containerColor = TerracottaPrimary,
                        contentColor = Color.White
                    ),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Close Profile", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

// ==========================================
// UTILITY DATE STRINGS CONVERTER METHODS
// ==========================================
fun getMonthName(month: Int): String {
    return when (month) {
        1 -> "January"
        2 -> "February"
        3 -> "March"
        4 -> "April"
        5 -> "May"
        6 -> "June"
        7 -> "July"
        8 -> "August"
        9 -> "September"
        10 -> "October"
        11 -> "November"
        12 -> "December"
        else -> "May"
    }
}

fun formatDateString(millis: Long): String {
    val date = Date(millis)
    val sdf = SimpleDateFormat("MMM dd, yyyy 'at' hh:mm a", Locale.getDefault())
    return sdf.format(date)
}
