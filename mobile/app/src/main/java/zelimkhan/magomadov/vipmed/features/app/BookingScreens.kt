package zelimkhan.magomadov.vipmed.features.app

import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.CalendarMonth
import androidx.compose.material.icons.rounded.CheckCircle
import androidx.compose.material.icons.rounded.MedicalServices
import androidx.compose.material.icons.rounded.Science
import androidx.compose.material.icons.rounded.Schedule
import androidx.compose.material.icons.rounded.Star
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import zelimkhan.magomadov.vipmed.R
import zelimkhan.magomadov.vipmed.core.common.ScreenStatus
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
    LaunchedEffect(Unit) {
        onEvent(BookingEvent.LoadServices)
    }

    BookingScaffold(
        title = stringResource(R.string.booking_title),
        onBackClick = { onEvent(BookingEvent.BackClick) },
        actionText = stringResource(R.string.next_action),
        onActionClick = { onEvent(BookingEvent.ServiceNextClick) },
        modifier = modifier,
    ) {
        item { StepChips(activeStep = 0) }
        item { SectionHeader(title = stringResource(R.string.choose_service)) }
        when (state.status) {
            ScreenStatus.Loading -> {
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(32.dp),
                        contentAlignment = Alignment.Center,
                    ) {
                        CircularProgressIndicator()
                    }
                }
            }

            else -> {
                if (state.services.isEmpty()) {
                    item {
                        Text(
                            text = "Нет доступных услуг",
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.padding(16.dp),
                        )
                    }
                } else {
                    items(state.services) { service ->
                        val isSelected = state.selectedService?.id == service.id
                        ListCard(
                            title = service.title,
                            subtitle = service.category,
                            leadingIcon = Icons.Rounded.MedicalServices,
                            trailingText = if (service.priceKopecks > 0) {
                                "${service.priceKopecks / 100} ₽"
                            } else null,
                            onClick = { onEvent(BookingEvent.ServiceSelected(service)) },
                            selected = state.selectedService?.id == service.id,
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun BookingDoctorScreen(
    state: BookingState,
    onEvent: (BookingEvent) -> Unit,
    modifier: Modifier = Modifier,
) {
    LaunchedEffect(Unit) {
        onEvent(BookingEvent.LoadDoctors)
    }

    BookingScaffold(
        title = stringResource(R.string.booking_doctor_title),
        onBackClick = { onEvent(BookingEvent.BackClick) },
        actionText = stringResource(R.string.next_action),
        onActionClick = { onEvent(BookingEvent.DoctorNextClick) },
        modifier = modifier,
    ) {
        item { StepChips(activeStep = 1) }
        item { SectionHeader(title = stringResource(R.string.choose_doctor)) }
        when (state.status) {
            ScreenStatus.Loading -> {
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(32.dp),
                        contentAlignment = Alignment.Center,
                    ) {
                        CircularProgressIndicator()
                    }
                }
            }

            else -> {
                if (state.doctors.isEmpty()) {
                    item {
                        Text(
                            text = "Нет врачей",
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.padding(16.dp),
                        )
                    }
                } else {
                    items(state.doctors) { doctor ->
                        DoctorCard(
                            name = "${doctor.lastName} ${doctor.firstName}".trim(),
                            specialty = doctor.specialty,
                            rating = "4.9",
                            action = stringResource(R.string.choose_action),
                            selected = state.selectedDoctor?.id == doctor.id,
                            onClick = { onEvent(BookingEvent.DoctorSelected(doctor)) },
                        )
                    }
                }
            }
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
            val dateOptions = remember {
                val today = java.time.LocalDate.now()
                (0..2).map { offset ->
                    val d = today.plusDays(offset.toLong())
                    val label = when (offset) {
                        0 -> "Сегодня"
                        1 -> "Завтра"
                        else -> "%02d.%02d".format(d.dayOfMonth, d.monthValue)
                    }
                    label to d.toString()
                }
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                dateOptions.forEach { (label, iso) ->
                    InfoChip(
                        text = label,
                        icon = Icons.Rounded.CalendarMonth,
                        color = if (state.selectedDate == iso) {
                            MaterialTheme.colorScheme.primaryContainer
                        } else {
                            MaterialTheme.colorScheme.surfaceContainerHighest
                        },
                        onClick = { onEvent(BookingEvent.DateSelected(iso)) },
                    )
                }
            }
        }
        item {
            val timeOptions = listOf("09:30", "12:00", "18:30")
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                timeOptions.forEach { time ->
                    InfoChip(
                        text = time,
                        icon = Icons.Rounded.Schedule,
                        color = if (state.selectedTime == time) {
                            MaterialTheme.colorScheme.primaryContainer
                        } else {
                            MaterialTheme.colorScheme.surfaceContainerHighest
                        },
                        onClick = { onEvent(BookingEvent.TimeSelected(time)) },
                    )
                }
            }
        }
        item {
            val dateLabel = when (state.selectedDate) {
                "" -> "Дата не выбрана"
                java.time.LocalDate.now().toString() -> "Сегодня"
                java.time.LocalDate.now().plusDays(1).toString() -> "Завтра"
                else -> state.selectedDate
            }
            GradientPanel(
                title = "$dateLabel ${state.selectedTime.ifEmpty { "— выберите время" }}",
                subtitle = state.selectedDoctor?.let {
                    "${it.lastName} ${it.firstName}".trim()
                } ?: stringResource(R.string.doctor_ivanova),
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
                title = state.selectedService?.title ?: "Услуга",
                subtitle = state.selectedDoctor?.let {
                    "${it.lastName} ${it.firstName}".trim()
                } ?: "Врач",
                leadingIcon = Icons.Rounded.MedicalServices,
                trailingText = state.selectedService?.let {
                    if (it.priceKopecks > 0) "${it.priceKopecks / 100} ₽" else null
                },
            )
        }
        item {
            ListCard(
                title = state.selectedDate.ifEmpty { "Сегодня" },
                subtitle = state.selectedTime.ifEmpty { "09:30" },
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
        if (state.isLoading) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    contentAlignment = Alignment.Center,
                ) {
                    CircularProgressIndicator()
                }
            }
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
                    title = state.selectedService?.title ?: "Услуга",
                    subtitle = state.selectedDoctor?.let {
                        "${it.lastName} ${it.firstName}".trim()
                    } ?: "Врач",
                    leadingIcon = Icons.Rounded.MedicalServices,
                    trailingText = state.selectedTime.ifEmpty { "09:30" },
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
    Row(
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        modifier = Modifier.horizontalScroll(rememberScrollState())
    ) {
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
            state = BookingState(status = ScreenStatus.Success),
            onEvent = {},
        )
    }
}
