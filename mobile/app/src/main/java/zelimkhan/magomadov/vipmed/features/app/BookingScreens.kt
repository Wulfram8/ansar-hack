package zelimkhan.magomadov.vipmed.features.app

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.CalendarMonth
import androidx.compose.material.icons.rounded.CheckCircle
import androidx.compose.material.icons.rounded.MedicalServices
import androidx.compose.material.icons.rounded.Science
import androidx.compose.material.icons.rounded.Schedule
import androidx.compose.material.icons.rounded.Star
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import zelimkhan.magomadov.vipmed.R
import zelimkhan.magomadov.vipmed.core.ui.DoctorCard
import zelimkhan.magomadov.vipmed.core.ui.GradientPanel
import zelimkhan.magomadov.vipmed.core.ui.InfoChip
import zelimkhan.magomadov.vipmed.core.ui.ListCard
import zelimkhan.magomadov.vipmed.core.ui.PrimaryActionButton
import zelimkhan.magomadov.vipmed.core.ui.SectionHeader
import zelimkhan.magomadov.vipmed.core.ui.VipTopBar
import zelimkhan.magomadov.vipmed.ui.theme.VipMedTheme

@Composable
fun BookingServiceScreen(
    state: BookingState,
    onEvent: (BookingEvent) -> Unit,
    modifier: Modifier = Modifier,
) {
    BookingScaffold(
        title = stringResource(R.string.booking_title),
        onBackClick = { onEvent(BookingEvent.BackClick) },
        actionText = stringResource(R.string.next_action),
        onActionClick = { onEvent(BookingEvent.ServiceNextClick) },
        modifier = modifier,
    ) {
        item { StepChips(activeStep = 0) }
        item { SectionHeader(title = stringResource(R.string.choose_service)) }
        item {
            ListCard(
                title = stringResource(R.string.service_cardiology),
                subtitle = stringResource(R.string.service_cardiology_desc),
                leadingIcon = Icons.Rounded.MedicalServices,
                trailingText = stringResource(R.string.price_value),
            )
        }
        item {
            ListCard(
                title = stringResource(R.string.service_tests),
                subtitle = stringResource(R.string.service_tests_desc),
                leadingIcon = Icons.Rounded.Science,
            )
        }
        item {
            ListCard(
                title = stringResource(R.string.service_ultrasound),
                subtitle = stringResource(R.string.service_ultrasound_desc),
                leadingIcon = Icons.Rounded.CalendarMonth,
            )
        }
    }
}

@Composable
fun BookingDoctorScreen(
    state: BookingState,
    onEvent: (BookingEvent) -> Unit,
    modifier: Modifier = Modifier,
) {
    BookingScaffold(
        title = stringResource(R.string.booking_doctor_title),
        onBackClick = { onEvent(BookingEvent.BackClick) },
        actionText = stringResource(R.string.next_action),
        onActionClick = { onEvent(BookingEvent.DoctorNextClick) },
        modifier = modifier,
    ) {
        item { StepChips(activeStep = 1) }
        item { SectionHeader(title = stringResource(R.string.choose_doctor)) }
        items(count = 3) {
            DoctorCard(
                name = stringResource(R.string.doctor_ivanova),
                specialty = stringResource(R.string.doctor_specialty),
                rating = stringResource(R.string.doctor_rating),
                action = stringResource(R.string.choose_action),
                onClick = { onEvent(BookingEvent.DoctorNextClick) },
            )
        }
    }
}

@Composable
fun BookingDateTimeScreen(
    state: BookingState,
    onEvent: (BookingEvent) -> Unit,
    modifier: Modifier = Modifier,
) {
    BookingScaffold(
        title = stringResource(R.string.booking_time_title),
        onBackClick = { onEvent(BookingEvent.BackClick) },
        actionText = stringResource(R.string.next_action),
        onActionClick = { onEvent(BookingEvent.DateNextClick) },
        modifier = modifier,
    ) {
        item { StepChips(activeStep = 2) }
        item { SectionHeader(title = stringResource(R.string.choose_date_time)) }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                InfoChip(text = stringResource(R.string.date_today), icon = Icons.Rounded.CalendarMonth)
                InfoChip(text = stringResource(R.string.date_tomorrow), icon = Icons.Rounded.CalendarMonth)
                InfoChip(text = stringResource(R.string.date_after), icon = Icons.Rounded.CalendarMonth)
            }
        }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                InfoChip(text = stringResource(R.string.time_morning), icon = Icons.Rounded.Schedule)
                InfoChip(text = stringResource(R.string.time_day), icon = Icons.Rounded.Schedule)
                InfoChip(text = stringResource(R.string.time_evening), icon = Icons.Rounded.Schedule)
            }
        }
        item {
            GradientPanel(
                title = stringResource(R.string.visit_time),
                subtitle = stringResource(R.string.doctor_ivanova),
                icon = Icons.Rounded.Schedule,
            )
        }
    }
}

@Composable
fun BookingConfirmScreen(
    state: BookingState,
    onEvent: (BookingEvent) -> Unit,
    modifier: Modifier = Modifier,
) {
    BookingScaffold(
        title = stringResource(R.string.booking_confirm_title),
        onBackClick = { onEvent(BookingEvent.BackClick) },
        actionText = stringResource(R.string.confirm_action),
        onActionClick = { onEvent(BookingEvent.ConfirmClick) },
        modifier = modifier,
    ) {
        item { StepChips(activeStep = 3) }
        item { SectionHeader(title = stringResource(R.string.booking_summary)) }
        item {
            ListCard(
                title = state.selectedService,
                subtitle = state.selectedDoctor,
                leadingIcon = Icons.Rounded.MedicalServices,
                trailingText = stringResource(R.string.price_value),
            )
        }
        item {
            ListCard(
                title = state.selectedDate,
                subtitle = state.selectedTime,
                leadingIcon = Icons.Rounded.Schedule,
            )
        }
        item {
            ListCard(
                title = stringResource(R.string.clinic_name),
                subtitle = stringResource(R.string.clinic_address),
                leadingIcon = Icons.Rounded.CalendarMonth,
            )
        }
    }
}

@Composable
fun BookingSuccessScreen(
    state: BookingState,
    onEvent: (BookingEvent) -> Unit,
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
            Column(verticalArrangement = Arrangement.spacedBy(18.dp)) {
                GradientPanel(
                    title = stringResource(R.string.booking_success_title),
                    subtitle = stringResource(R.string.booking_success_subtitle),
                    icon = Icons.Rounded.CheckCircle,
                )
                ListCard(
                    title = state.selectedService,
                    subtitle = state.selectedDoctor,
                    leadingIcon = Icons.Rounded.MedicalServices,
                    trailingText = state.selectedTime,
                )
            }
            PrimaryActionButton(
                text = stringResource(R.string.to_appointments),
                modifier = Modifier.fillMaxWidth(),
                onClick = { onEvent(BookingEvent.DoneClick) },
            )
        }
    }
}

@Composable
private fun BookingScaffold(
    title: String,
    actionText: String,
    onBackClick: () -> Unit,
    onActionClick: () -> Unit,
    modifier: Modifier = Modifier,
    content: androidx.compose.foundation.lazy.LazyListScope.() -> Unit,
) {
    Scaffold(
        modifier = modifier,
        topBar = {
            VipTopBar(
                title = title,
                onBackClick = onBackClick,
            )
        },
        bottomBar = {
            PrimaryActionButton(
                text = actionText,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                onClick = onActionClick,
            )
        },
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding),
            contentPadding = androidx.compose.foundation.layout.PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            content = content,
        )
    }
}

@Composable
private fun StepChips(activeStep: Int) {
    val steps = listOf(
        stringResource(R.string.step_service),
        stringResource(R.string.step_doctor),
        stringResource(R.string.step_time),
        stringResource(R.string.step_confirm),
    )
    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        steps.forEachIndexed { index, step ->
            InfoChip(
                text = step,
                icon = if (index <= activeStep) Icons.Rounded.CheckCircle else null,
                color = if (index == activeStep) {
                    MaterialTheme.colorScheme.primaryContainer
                } else {
                    MaterialTheme.colorScheme.surfaceContainerHighest
                },
            )
        }
    }
}

@Preview(showSystemUi = true)
@Composable
private fun BookingServiceScreenPreview() {
    VipMedTheme(dynamicColor = false) {
        BookingServiceScreen(
            state = BookingState(),
            onEvent = {},
        )
    }
}
