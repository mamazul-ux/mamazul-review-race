package com.example.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorScheme = darkColorScheme(
    primary = TerracottaDarkPrimary,
    secondary = AgaveDarkSecondary,
    tertiary = MayanDarkGold,
    background = DarkClayBackground,
    surface = DarkSurfaceElevated,
    onPrimary = Color.Black,
    onSecondary = Color.White,
    onTertiary = Color.Black,
    onBackground = Color(0xFFECE5E1),
    onSurface = Color(0xFFECE5E1)
)

private val LightColorScheme = lightColorScheme(
    primary = TerracottaPrimary,
    secondary = AgaveGreenSecondary,
    tertiary = MayanGoldTertiary,
    background = SandLightBackground,
    surface = WarmClaySurface,
    onPrimary = Color.White,
    onSecondary = Color.White,
    onTertiary = Color.Black,
    onBackground = AgaveGreenSecondary,
    onSurface = AgaveGreenSecondary
)

@Composable
fun MyApplicationTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
