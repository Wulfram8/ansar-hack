package zelimkhan.magomadov.vipmed.features.app

import androidx.compose.foundation.clickable
import androidx.compose.material.icons.rounded.CalendarMonth
import androidx.compose.material3.DatePicker
import androidx.compose.material3.DatePickerDialog
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberDatePickerState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue

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
import androidx.compose.material.icons.rounded.CheckCircle
import androidx.compose.material.icons.rounded.Favorite
import androidx.compose.material.icons.rounded.MedicalServices
import androidx.compose.material3.CircularProgressIndicator
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
                if (state.error != null) {
                    Text(
                        text = state.error,
                        color = MaterialTheme.colorScheme.error,
                    )
                }
            }
            Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
                if (state.isLoading) {
                    Box(modifier = Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator()
                    }
                } else {
                    PrimaryActionButton(
                        text = stringResource(R.string.continue_action),
                        modifier = Modifier.fillMaxWidth(),
                        onClick = { onEvent(AuthEvent.ContinueClick) },
                    )
                }
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
                    text = state.errorMessage ?: stringResource(R.string.otp_error),
                    color = MaterialTheme.colorScheme.error,
                )
            }
            Text(
                text = stringResource(R.string.otp_timer),
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Spacer(modifier = Modifier.weight(1f))
            if (state.isLoading) {
                Box(modifier = Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
            } else {
                PrimaryActionButton(
                    text = stringResource(R.string.continue_action),
                    modifier = Modifier.fillMaxWidth(),
                    onClick = { onEvent(OtpEvent.ContinueClick) },
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
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
                    value = state.firstName,
                    onValueChange = { onEvent(ProfileSetupEvent.FirstNameChanged(name = it)) },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text(text = stringResource(R.string.firstname_label)) },
                    singleLine = true,
                    shape = RoundedCornerShape(18.dp),
                )
                OutlinedTextField(
                    value = state.lastName,
                    onValueChange = { onEvent(ProfileSetupEvent.LastNameChanged(name = it)) },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text(text = stringResource(R.string.lastname_label)) },
                    singleLine = true,
                    shape = RoundedCornerShape(18.dp),
                )
                BirthDateField(
                    value = state.birthDate,
                    onDateSelected = { onEvent(ProfileSetupEvent.BirthDateChanged(date = it)) },
                )
                if (state.error != null) {
                    Text(
                        text = state.error,
                        color = MaterialTheme.colorScheme.error,
                    )
                }
            }
            if (state.isLoading) {
                Box(modifier = Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
            } else {
                PrimaryActionButton(
                    text = stringResource(R.string.save_action),
                    modifier = Modifier.fillMaxWidth(),
                    onClick = { onEvent(ProfileSetupEvent.SaveClick) },
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun BirthDateField(
    value: String,
    onDateSelected: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    var showDialog by remember { mutableStateOf(false) }
    val display = remember(value) { formatBirthDateForDisplay(value) }

    Box(modifier = modifier.fillMaxWidth()) {
        OutlinedTextField(
            value = display,
            onValueChange = {},
            readOnly = true,
            enabled = false,
            modifier = Modifier.fillMaxWidth(),
            label = { Text(text = stringResource(R.string.birthday_label)) },
            placeholder = { Text(text = stringResource(R.string.birthday_hint)) },
            trailingIcon = {
                Icon(imageVector = Icons.Rounded.CalendarMonth, contentDescription = null)
            },
            singleLine = true,
            shape = RoundedCornerShape(18.dp),
            colors = OutlinedTextFieldDefaults.colors(
                disabledTextColor = MaterialTheme.colorScheme.onSurface,
                disabledBorderColor = MaterialTheme.colorScheme.outline,
                disabledLabelColor = MaterialTheme.colorScheme.onSurfaceVariant,
                disabledPlaceholderColor = MaterialTheme.colorScheme.onSurfaceVariant,
                disabledTrailingIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
            ),
        )
        // Прозрачный слой-перехватчик клика поверх отключённого поля.
        Box(
            modifier = Modifier
                .matchParentSize()
                .clip(RoundedCornerShape(18.dp))
                .clickable { showDialog = true },
        )
    }

    if (showDialog) {
        val datePickerState = rememberDatePickerState()
        DatePickerDialog(
            onDismissRequest = { showDialog = false },
            confirmButton = {
                TextButton(onClick = {
                    datePickerState.selectedDateMillis?.let { millis ->
                        onDateSelected(millisToIsoDate(millis))
                    }
                    showDialog = false
                }) {
                    Text(text = stringResource(R.string.save_action))
                }
            },
            dismissButton = {
                TextButton(onClick = { showDialog = false }) {
                    Text(text = stringResource(R.string.cancel_action))
                }
            },
        ) {
            DatePicker(state = datePickerState)
        }
    }
}

private fun millisToIsoDate(millis: Long): String {
    val date = java.time.Instant.ofEpochMilli(millis)
        .atZone(java.time.ZoneOffset.UTC)
        .toLocalDate()
    return date.toString() // ISO: yyyy-MM-dd
}

private fun formatBirthDateForDisplay(iso: String): String {
    if (iso.isBlank()) return ""
    return try {
        val date = java.time.LocalDate.parse(iso)
        "%02d.%02d.%04d".format(date.dayOfMonth, date.monthValue, date.year)
    } catch (e: Exception) {
        iso
    }
}

@Composable
fun LeadRequestScreen(
    state: LeadRequestState,
    onEvent: (LeadRequestEvent) -> Unit,
    modifier: Modifier = Modifier,
) {
    Scaffold(
        modifier = modifier,
        topBar = {
            VipTopBar(
                title = stringResource(R.string.lead_request_title),
                onBackClick = { onEvent(LeadRequestEvent.BackClick) },
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
            if (state.isSubmitted) {
                Column(verticalArrangement = Arrangement.spacedBy(18.dp)) {
                    GradientPanel(
                        title = stringResource(R.string.lead_success_title),
                        subtitle = stringResource(R.string.lead_success_subtitle),
                        icon = Icons.Rounded.CheckCircle,
                    )
                }
                PrimaryActionButton(
                    text = stringResource(R.string.ready),
                    modifier = Modifier.fillMaxWidth(),
                    onClick = { onEvent(LeadRequestEvent.DoneClick) },
                )
            } else {
                Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                    Text(
                        text = stringResource(R.string.lead_request_headline),
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Black,
                    )
                    Text(
                        text = stringResource(R.string.lead_request_subtitle),
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        style = MaterialTheme.typography.bodyLarge,
                    )
                    OutlinedTextField(
                        value = state.name,
                        onValueChange = { onEvent(LeadRequestEvent.NameChanged(name = it)) },
                        modifier = Modifier.fillMaxWidth(),
                        label = { Text(text = stringResource(R.string.lead_name_label)) },
                        singleLine = true,
                        shape = RoundedCornerShape(18.dp),
                    )
                    OutlinedTextField(
                        value = state.phone,
                        onValueChange = { onEvent(LeadRequestEvent.PhoneChanged(phone = it)) },
                        modifier = Modifier.fillMaxWidth(),
                        label = { Text(text = stringResource(R.string.lead_phone_label)) },
                        singleLine = true,
                        shape = RoundedCornerShape(18.dp),
                    )
                    OutlinedTextField(
                        value = state.comment,
                        onValueChange = { onEvent(LeadRequestEvent.CommentChanged(comment = it)) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(120.dp),
                        label = { Text(text = stringResource(R.string.lead_comment_label)) },
                        shape = RoundedCornerShape(18.dp),
                    )
                    if (state.error != null) {
                        Text(
                            text = state.error,
                            color = MaterialTheme.colorScheme.error,
                        )
                    }
                }
                if (state.isLoading) {
                    Box(modifier = Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator()
                    }
                } else {
                    PrimaryActionButton(
                        text = stringResource(R.string.lead_submit_action),
                        modifier = Modifier.fillMaxWidth(),
                        onClick = { onEvent(LeadRequestEvent.SubmitClick) },
                    )
                }
            }
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
