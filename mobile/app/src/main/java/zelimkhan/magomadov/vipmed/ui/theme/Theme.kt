package zelimkhan.magomadov.vipmed.ui.theme

import androidx.compose.ui.graphics.Color
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val DarkColorScheme = darkColorScheme(
    primary = MedicalBlue80,
    secondary = Mint80,
    tertiary = Coral80,
    background = Color(0xFF0E1418),
    surface = Color(0xFF111A1F),
    surfaceContainer = Color(0xFF172228),
    surfaceContainerLow = Color(0xFF142026),
    surfaceContainerHighest = Color(0xFF223039),
)

private val LightColorScheme = lightColorScheme(
    primary = MedicalBlue40,
    secondary = Mint40,
    tertiary = Coral40,
    background = Color(0xFFF6FAFB),
    surface = Color(0xFFFFFFFF),
    surfaceContainer = Color(0xFFEAF2F5),
    surfaceContainerLow = Color(0xFFFFFFFF),
    surfaceContainerHighest = Color(0xFFDDE9EE),
    primaryContainer = Color(0xFFD6F0FA),
    secondaryContainer = Color(0xFFDDF4EC),
    tertiaryContainer = Color(0xFFFFE1DA),
    onBackground = Color(0xFF152127),
    onSurface = Color(0xFF152127),
    onSurfaceVariant = Color(0xFF5A6870),
)

@Composable
fun VipMedTheme(
    darkTheme: Boolean = false,
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) {
        DarkColorScheme
    } else {
        LightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
