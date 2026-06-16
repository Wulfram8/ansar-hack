package zelimkhan.magomadov.vipmed.features.app

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Article
import androidx.compose.material.icons.rounded.CalendarMonth
import androidx.compose.material.icons.rounded.ChatBubble
import androidx.compose.material.icons.rounded.CreditCard
import androidx.compose.material.icons.rounded.DarkMode
import androidx.compose.material.icons.rounded.Favorite
import androidx.compose.material.icons.rounded.FilterList
import androidx.compose.material.icons.rounded.HelpOutline
import androidx.compose.material.icons.rounded.Logout
import androidx.compose.material.icons.rounded.MedicalServices
import androidx.compose.material.icons.rounded.MonitorHeart
import androidx.compose.material.icons.rounded.Notifications
import androidx.compose.material.icons.rounded.Person
import androidx.compose.material.icons.rounded.Science
import androidx.compose.material.icons.rounded.Security
import androidx.compose.material.icons.rounded.Settings
import androidx.compose.material.icons.rounded.Share
import androidx.compose.material.icons.rounded.Star
import androidx.compose.material.icons.rounded.Tune
import androidx.compose.material3.HorizontalDivider
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
import zelimkhan.magomadov.vipmed.core.ui.AppointmentCard
import zelimkhan.magomadov.vipmed.core.ui.Avatar
import zelimkhan.magomadov.vipmed.core.ui.DoctorCard
import zelimkhan.magomadov.vipmed.core.ui.GradientPanel
import zelimkhan.magomadov.vipmed.core.ui.InfoChip
import zelimkhan.magomadov.vipmed.core.ui.ListCard
import zelimkhan.magomadov.vipmed.core.ui.MetricCard
import zelimkhan.magomadov.vipmed.core.ui.PrimaryActionButton
import zelimkhan.magomadov.vipmed.core.ui.SectionHeader
import zelimkhan.magomadov.vipmed.core.ui.SecondaryActionButton
import zelimkhan.magomadov.vipmed.core.ui.VipTopBar
import zelimkhan.magomadov.vipmed.core.ui.appNavPaddings
import zelimkhan.magomadov.vipmed.navigation.VipMedRoute
import zelimkhan.magomadov.vipmed.ui.theme.VipMedTheme

@Composable
fun HomeScreen(
    state: HomeState,
    onEvent: (HomeEvent) -> Unit,
    onBottomRouteClick: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    Scaffold(
        modifier = modifier,
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding),
            contentPadding = androidx.compose.foundation.layout.PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                ) {
                    Column(verticalArrangement = Arrangement.spacedBy(3.dp)) {
                        Text(
                            text = stringResource(R.string.home_greeting),
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Black,
                        )
                        Text(
                            text = stringResource(R.string.home_subtitle),
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                    Avatar(
                        initials = "АП",
                        modifier = Modifier.padding(top = 2.dp),
                    )
                }
            }
            item {
                SectionHeader(
                    title = stringResource(R.string.nearest_visit),
                    action = stringResource(R.string.all_action),
                    onActionClick = { onBottomRouteClick(VipMedRoute.Appointments.route) },
                )
            }
            item {
                AppointmentCard(
                    title = stringResource(R.string.cardiology_visit),
                    doctor = stringResource(R.string.doctor_ivanova),
                    date = stringResource(R.string.visit_time),
                    status = stringResource(R.string.confirmed),
                    onClick = { onBottomRouteClick(VipMedRoute.AppointmentDetails.route) },
                )
            }
            item {
                GradientPanel(
                    title = stringResource(R.string.loyalty_title),
                    subtitle = stringResource(R.string.loyalty_subtitle),
                    icon = Icons.Rounded.Star,
                )
            }
            item {
                SectionHeader(title = stringResource(R.string.quick_actions))
            }
            item {
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    ListCard(
                        title = stringResource(R.string.book_doctor),
                        subtitle = stringResource(R.string.next_action),
                        leadingIcon = Icons.Rounded.CalendarMonth,
                        modifier = Modifier.weight(1f),
                        onClick = { onEvent(HomeEvent.BookClick) },
                    )
                    ListCard(
                        title = stringResource(R.string.lab_results),
                        subtitle = stringResource(R.string.ready),
                        leadingIcon = Icons.Rounded.Science,
                        modifier = Modifier.weight(1f),
                        onClick = { onEvent(HomeEvent.LabResultsClick) },
                    )
                }
            }
            item {
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    MetricCard(
                        title = stringResource(R.string.heart_rate),
                        value = stringResource(R.string.heart_rate_value),
                        icon = Icons.Rounded.Favorite,
                        modifier = Modifier.weight(1f),
                    )
                    MetricCard(
                        title = stringResource(R.string.pressure),
                        value = stringResource(R.string.pressure_value),
                        icon = Icons.Rounded.MonitorHeart,
                        modifier = Modifier.weight(1f),
                    )
                }
            }
            item {
                Spacer(modifier = Modifier.appNavPaddings())
            }
        }
    }
}

@Composable
fun AppointmentsScreen(
    state: AppointmentsState,
    onEvent: (AppointmentsEvent) -> Unit,
    onBottomRouteClick: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    Scaffold(
        modifier = modifier,
        topBar = {
            VipTopBar(
                title = stringResource(R.string.appointments_title),
                actionIcon = Icons.Rounded.Tune,
                onActionClick = { onEvent(AppointmentsEvent.FilterClick) },
            )
        },
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding),
            contentPadding = androidx.compose.foundation.layout.PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            item {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    InfoChip(text = stringResource(R.string.upcoming))
                    InfoChip(text = stringResource(R.string.past))
                }
            }
            item {
                AppointmentCard(
                    title = stringResource(R.string.cardiology_visit),
                    doctor = stringResource(R.string.doctor_ivanova),
                    date = stringResource(R.string.visit_time),
                    status = stringResource(R.string.confirmed),
                    onClick = { onEvent(AppointmentsEvent.DetailsClick) },
                )
            }
            item {
                Spacer(modifier = Modifier.appNavPaddings())
            }
        }
    }
}

@Composable
fun AppointmentDetailsScreen(
    state: AppointmentDetailsState,
    onEvent: (AppointmentDetailsEvent) -> Unit,
    modifier: Modifier = Modifier,
) {
    Scaffold(
        modifier = modifier,
        topBar = {
            VipTopBar(
                title = stringResource(R.string.appointment_details_title),
                onBackClick = { onEvent(AppointmentDetailsEvent.BackClick) },
                actionIcon = Icons.Rounded.Share,
                onActionClick = {},
            )
        },
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            AppointmentCard(
                title = stringResource(R.string.cardiology_visit),
                doctor = stringResource(R.string.doctor_ivanova),
                date = stringResource(R.string.visit_time),
                status = stringResource(R.string.confirmed),
                onClick = {},
            )
            ListCard(
                title = stringResource(R.string.clinic_name),
                subtitle = stringResource(R.string.clinic_address),
                leadingIcon = Icons.Rounded.MedicalServices,
            )
            Text(
                text = stringResource(R.string.appointment_notes),
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            PrimaryActionButton(
                text = stringResource(R.string.open_chat),
                modifier = Modifier.fillMaxWidth(),
                onClick = { onEvent(AppointmentDetailsEvent.ChatClick) },
            )
            SecondaryActionButton(
                text = stringResource(R.string.cancel_action),
                modifier = Modifier.fillMaxWidth(),
                onClick = {},
            )
        }
    }
}

@Composable
fun DoctorsScreen(
    state: DoctorsState,
    onEvent: (DoctorsEvent) -> Unit,
    onBottomRouteClick: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    Scaffold(
        modifier = modifier,
        topBar = {
            VipTopBar(
                title = stringResource(R.string.doctors_title),
                actionIcon = Icons.Rounded.FilterList,
                onActionClick = { onEvent(DoctorsEvent.FilterClick) },
            )
        },
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding),
            contentPadding = androidx.compose.foundation.layout.PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            item {
                ListCard(
                    title = stringResource(R.string.search_hint),
                    subtitle = stringResource(R.string.service_cardiology_desc),
                    leadingIcon = Icons.Rounded.Person,
                )
            }
            items(listOf(1, 2, 3)) {
                DoctorCard(
                    name = stringResource(R.string.doctor_ivanova),
                    specialty = stringResource(R.string.doctor_specialty),
                    rating = stringResource(R.string.doctor_rating),
                    action = stringResource(R.string.choose_action),
                    onClick = { onEvent(DoctorsEvent.DoctorClick) },
                )
            }
            item {
                Spacer(modifier = Modifier.appNavPaddings())
            }
        }
    }
}

@Composable
fun DoctorDetailsScreen(
    state: DoctorDetailsState,
    onEvent: (DoctorDetailsEvent) -> Unit,
    modifier: Modifier = Modifier,
) {
    Scaffold(
        modifier = modifier,
        topBar = {
            VipTopBar(
                title = stringResource(R.string.doctor_profile_title),
                onBackClick = { onEvent(DoctorDetailsEvent.BackClick) },
            )
        },
        bottomBar = {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                horizontalArrangement = Arrangement.spacedBy(16.dp),
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = stringResource(R.string.price_value),
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Black,
                    )
                    Text(
                        text = stringResource(R.string.cardiology_visit),
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
                PrimaryActionButton(
                    text = stringResource(R.string.book_doctor),
                    onClick = { onEvent(DoctorDetailsEvent.BookClick) },
                )
            }
        },
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding),
            contentPadding = androidx.compose.foundation.layout.PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            item {
                GradientPanel(
                    title = stringResource(R.string.doctor_ivanova),
                    subtitle = stringResource(R.string.doctor_specialty),
                    icon = Icons.Rounded.MedicalServices,
                )
            }
            item {
                Text(
                    text = stringResource(R.string.about_doctor),
                    style = MaterialTheme.typography.bodyLarge,
                )
            }
            item {
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    MetricCard(
                        title = stringResource(R.string.experience),
                        value = stringResource(R.string.experience_value),
                        icon = Icons.Rounded.MedicalServices,
                        modifier = Modifier.weight(1f),
                    )
                    MetricCard(
                        title = stringResource(R.string.reviews),
                        value = stringResource(R.string.reviews_value),
                        icon = Icons.Rounded.Star,
                        modifier = Modifier.weight(1f),
                    )
                }
            }
            item {
                SectionHeader(title = stringResource(R.string.nearest_slots))
            }
            item {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    InfoChip(text = stringResource(R.string.time_morning))
                    InfoChip(text = stringResource(R.string.time_day))
                    InfoChip(text = stringResource(R.string.time_evening))
                }
            }
        }
    }
}

@Composable
fun ProfileScreen(
    state: ProfileState,
    onEvent: (ProfileEvent) -> Unit,
    onBottomRouteClick: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    Scaffold(
        modifier = modifier,
        topBar = {
            VipTopBar(
                title = stringResource(R.string.profile_title),
                actionIcon = Icons.Rounded.Settings,
                onActionClick = { onEvent(ProfileEvent.SettingsClick) },
            )
        },
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding),
            contentPadding = androidx.compose.foundation.layout.PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            item {
                GradientPanel(
                    title = stringResource(R.string.profile_name),
                    subtitle = stringResource(R.string.profile_phone),
                    icon = Icons.Rounded.Person,
                )
            }
            item { SectionLabel(text = stringResource(R.string.account)) }
            item {
                ListCard(
                    title = stringResource(R.string.medical_card),
                    subtitle = stringResource(R.string.lab_results),
                    leadingIcon = Icons.Rounded.Article,
                    onClick = { onEvent(ProfileEvent.LabResultsClick) },
                )
            }
            item {
                ListCard(
                    title = stringResource(R.string.payments),
                    subtitle = stringResource(R.string.price_value),
                    leadingIcon = Icons.Rounded.CreditCard,
                )
            }
            item { SectionLabel(text = stringResource(R.string.settings)) }
            item {
                ListCard(
                    title = stringResource(R.string.dark_theme),
                    subtitle = stringResource(R.string.settings),
                    leadingIcon = Icons.Rounded.DarkMode,
                )
            }
            item {
                ListCard(
                    title = stringResource(R.string.security),
                    subtitle = stringResource(R.string.profile_phone),
                    leadingIcon = Icons.Rounded.Security,
                )
            }
            item { SectionLabel(text = stringResource(R.string.support)) }
            item {
                ListCard(
                    title = stringResource(R.string.help_center),
                    subtitle = stringResource(R.string.open_chat),
                    leadingIcon = Icons.Rounded.HelpOutline,
                )
            }
            item {
                ListCard(
                    title = stringResource(R.string.logout),
                    subtitle = stringResource(R.string.app_version),
                    leadingIcon = Icons.Rounded.Logout,
                    onClick = { onEvent(ProfileEvent.LogoutClick) },
                )
            }
            item {
                Text(
                    text = stringResource(R.string.app_version),
                    modifier = Modifier.fillMaxWidth(),
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    style = MaterialTheme.typography.bodySmall,
                )
            }
            item {
                Spacer(modifier = Modifier.appNavPaddings())
            }
        }
    }
}

@Composable
fun LabResultsScreen(
    state: LabResultsState,
    onEvent: (LabResultsEvent) -> Unit,
    modifier: Modifier = Modifier,
) {
    Scaffold(
        modifier = modifier,
        topBar = {
            VipTopBar(
                title = stringResource(R.string.analysis_title),
                onBackClick = { onEvent(LabResultsEvent.BackClick) },
                actionIcon = Icons.Rounded.FilterList,
                onActionClick = { onEvent(LabResultsEvent.FilterClick) },
            )
        },
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding),
            contentPadding = androidx.compose.foundation.layout.PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            item {
                ListCard(
                    title = stringResource(R.string.blood_test),
                    subtitle = stringResource(R.string.ready),
                    leadingIcon = Icons.Rounded.Science,
                    trailingText = stringResource(R.string.ready),
                    onClick = { onEvent(LabResultsEvent.ResultClick) },
                )
            }
            item {
                ListCard(
                    title = stringResource(R.string.biochemistry),
                    subtitle = stringResource(R.string.ready),
                    leadingIcon = Icons.Rounded.Science,
                    trailingText = stringResource(R.string.ready),
                    onClick = { onEvent(LabResultsEvent.ResultClick) },
                )
            }
            item {
                ListCard(
                    title = stringResource(R.string.ecg),
                    subtitle = stringResource(R.string.ready),
                    leadingIcon = Icons.Rounded.MonitorHeart,
                    trailingText = stringResource(R.string.ready),
                    onClick = { onEvent(LabResultsEvent.ResultClick) },
                )
            }
            item {
                ListCard(
                    title = stringResource(R.string.ultrasound),
                    subtitle = stringResource(R.string.in_progress),
                    leadingIcon = Icons.Rounded.MedicalServices,
                    trailingText = stringResource(R.string.in_progress),
                    onClick = { onEvent(LabResultsEvent.ResultClick) },
                )
            }
            if (state.showDetails) {
                item {
                    HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
                    GradientPanel(
                        title = stringResource(R.string.blood_test),
                        subtitle = stringResource(R.string.ready),
                        icon = Icons.Rounded.Science,
                    )
                }
                item {
                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        PrimaryActionButton(
                            text = stringResource(R.string.download_pdf),
                            modifier = Modifier.weight(1f),
                            onClick = {},
                        )
                        SecondaryActionButton(
                            text = stringResource(R.string.share_action),
                            modifier = Modifier.weight(1f),
                            onClick = {},
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun SectionLabel(text: String) {
    Text(
        text = text,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
        style = MaterialTheme.typography.titleSmall,
        fontWeight = FontWeight.Bold,
    )
}

@Preview(showSystemUi = true)
@Composable
private fun HomeScreenPreview() {
    VipMedTheme(dynamicColor = false) {
        HomeScreen(
            state = HomeState(),
            onEvent = {},
            onBottomRouteClick = {},
        )
    }
}

@Preview(showSystemUi = true)
@Composable
private fun DoctorsScreenPreview() {
    VipMedTheme(dynamicColor = false) {
        DoctorsScreen(
            state = DoctorsState(),
            onEvent = {},
            onBottomRouteClick = {},
        )
    }
}
