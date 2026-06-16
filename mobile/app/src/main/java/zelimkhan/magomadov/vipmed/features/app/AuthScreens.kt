package zelimkhan.magomadov.vipmed.features.app

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Favorite
import androidx.compose.material.icons.rounded.MedicalServices
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import zelimkhan.magomadov.vipmed.R
import zelimkhan.magomadov.vipmed.core.ui.GradientPanel
import zelimkhan.magomadov.vipmed.core.ui.PrimaryActionButton
import zelimkhan.magomadov.vipmed.core.ui.VipTopBar
import zelimkhan.magomadov.vipmed.ui.theme.VipMedTheme

@Composable
fun SplashScreen(
    state: SplashState,
    onEvent: (SplashEvent) -> Unit,
    modifier: Modifier = Modifier,
) {
    LaunchedEffect(Unit) {
        onEvent(SplashEvent.Started)
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(28.dp),
        contentAlignment = Alignment.Center,
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(22.dp),
        ) {
            Box(
                modifier = Modifier
                    .height(112.dp)
                    .fillMaxWidth(0.42f)
                    .clip(RoundedCornerShape(34.dp))
                    .background(
                        Brush.linearGradient(
                            listOf(
                                MaterialTheme.colorScheme.primary,
                                MaterialTheme.colorScheme.tertiary,
                            )
                        )
                    ),
                contentAlignment = Alignment.Center,
            ) {
                androidx.compose.material3.Icon(
                    imageVector = Icons.Rounded.Favorite,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.onPrimary,
                )
            }
            Text(
                text = stringResource(R.string.app_name),
                style = MaterialTheme.typography.headlineLarge,
                fontWeight = FontWeight.Black,
            )
            Text(
                text = stringResource(R.string.splash_loading),
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                style = MaterialTheme.typography.bodyMedium,
                textAlign = TextAlign.Center,
            )
            LinearProgressIndicator(
                modifier = Modifier
                    .fillMaxWidth(0.38f)
                    .clip(RoundedCornerShape(8.dp)),
            )
        }
    }
}

@Composable
fun OnboardingScreen(
    state: OnboardingState,
    onEvent: (OnboardingEvent) -> Unit,
    modifier: Modifier = Modifier,
) {
    Scaffold(modifier = modifier) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(20.dp),
            verticalArrangement = Arrangement.SpaceBetween,
        ) {
            Spacer(modifier = Modifier.height(18.dp))
            Column(
                verticalArrangement = Arrangement.spacedBy(26.dp),
            ) {
                GradientPanel(
                    title = stringResource(R.string.clinic_name),
                    subtitle = stringResource(R.string.brand_tagline),
                    icon = Icons.Rounded.MedicalServices,
                )
                Text(
                    text = stringResource(R.string.onboarding_title),
                    style = MaterialTheme.typography.displaySmall,
                    fontWeight = FontWeight.Black,
                )
                Text(
                    text = stringResource(R.string.onboarding_subtitle),
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    style = MaterialTheme.typography.bodyLarge,
                )
            }
            PrimaryActionButton(
                text = stringResource(R.string.continue_action),
                modifier = Modifier.fillMaxWidth(),
                onClick = { onEvent(OnboardingEvent.ContinueClick) },
            )
        }
    }
}

@Composable
fun AuthScreen(
    state: AuthState,
    onEvent: (AuthEvent) -> Unit,
    modifier: Modifier = Modifier,
) {
    Scaffold(
        modifier = modifier,
        topBar = {
            VipTopBar(title = stringResource(R.string.auth_title))
        },
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = 20.dp, vertical = 18.dp),
            verticalArrangement = Arrangement.SpaceBetween,
        ) {
            Column(verticalArrangement = Arrangement.spacedBy(18.dp)) {
                Text(
                    text = stringResource(R.string.auth_headline),
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Black,
                )
                Text(
                    text = stringResource(R.string.auth_subtitle),
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    style = MaterialTheme.typography.bodyLarge,
                )
                OutlinedTextField(
                    value = state.phone,
                    onValueChange = { onEvent(AuthEvent.PhoneChanged(phone = it)) },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text(text = stringResource(R.string.phone_label)) },
                    singleLine = true,
                    shape = RoundedCornerShape(18.dp),
                )
            }
            Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
                PrimaryActionButton(
                    text = stringResource(R.string.continue_action),
                    modifier = Modifier.fillMaxWidth(),
                    onClick = { onEvent(AuthEvent.ContinueClick) },
                )
                Text(
                    text = stringResource(R.string.privacy_policy),
                    modifier = Modifier.fillMaxWidth(),
                    color = MaterialTheme.colorScheme.primary,
                    textAlign = TextAlign.Center,
                    style = MaterialTheme.typography.bodySmall,
                    fontWeight = FontWeight.SemiBold,
                )
            }
        }
    }
}

@Composable
fun OtpScreen(
    state: OtpState,
    onEvent: (OtpEvent) -> Unit,
    modifier: Modifier = Modifier,
) {
    Scaffold(
        modifier = modifier,
        topBar = {
            VipTopBar(
                title = stringResource(R.string.otp_title),
                onBackClick = { onEvent(OtpEvent.BackClick) },
            )
        },
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(18.dp),
        ) {
            Text(
                text = stringResource(R.string.otp_headline),
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Black,
            )
            Text(
                text = stringResource(R.string.otp_subtitle),
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            OutlinedTextField(
                value = state.code,
                onValueChange = { onEvent(OtpEvent.CodeChanged(code = it)) },
                modifier = Modifier.fillMaxWidth(),
                label = { Text(text = stringResource(R.string.otp_label)) },
                singleLine = true,
                isError = state.hasError,
                shape = RoundedCornerShape(18.dp),
            )
            if (state.hasError) {
                Text(
                    text = stringResource(R.string.otp_error),
                    color = MaterialTheme.colorScheme.error,
                )
            }
            Text(
                text = stringResource(R.string.otp_timer),
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Spacer(modifier = Modifier.weight(1f))
            PrimaryActionButton(
                text = stringResource(R.string.continue_action),
                modifier = Modifier.fillMaxWidth(),
                onClick = { onEvent(OtpEvent.ContinueClick) },
            )
        }
    }
}

@Composable
fun ProfileSetupScreen(
    state: ProfileSetupState,
    onEvent: (ProfileSetupEvent) -> Unit,
    modifier: Modifier = Modifier,
) {
    Scaffold(
        modifier = modifier,
        topBar = {
            VipTopBar(
                title = stringResource(R.string.profile_setup_title),
                onBackClick = { onEvent(ProfileSetupEvent.BackClick) },
            )
        },
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(20.dp),
            verticalArrangement = Arrangement.SpaceBetween,
        ) {
            Column(verticalArrangement = Arrangement.spacedBy(18.dp)) {
                Text(
                    text = stringResource(R.string.profile_setup_headline),
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Black,
                )
                OutlinedTextField(
                    value = state.fullName,
                    onValueChange = {},
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text(text = stringResource(R.string.name_label)) },
                    shape = RoundedCornerShape(18.dp),
                )
                OutlinedTextField(
                    value = state.birthday,
                    onValueChange = {},
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text(text = stringResource(R.string.birthday_label)) },
                    shape = RoundedCornerShape(18.dp),
                )
            }
            PrimaryActionButton(
                text = stringResource(R.string.save_action),
                modifier = Modifier.fillMaxWidth(),
                onClick = { onEvent(ProfileSetupEvent.SaveClick) },
            )
        }
    }
}

@Preview(showSystemUi = true)
@Composable
private fun OnboardingScreenPreview() {
    VipMedTheme(dynamicColor = false) {
        OnboardingScreen(
            state = OnboardingState(),
            onEvent = {},
        )
    }
}

@Preview(showSystemUi = true)
@Composable
private fun AuthScreenPreview() {
    VipMedTheme(dynamicColor = false) {
        AuthScreen(
            state = AuthState(),
            onEvent = {},
        )
    }
}
