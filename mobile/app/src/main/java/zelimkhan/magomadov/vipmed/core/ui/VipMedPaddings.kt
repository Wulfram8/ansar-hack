package zelimkhan.magomadov.vipmed.core.ui

import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

fun Modifier.appNavPaddings(): Modifier {
    return navigationBarsPadding()
        .padding(bottom = 84.dp)
        .padding(bottom = 32.dp)
}
