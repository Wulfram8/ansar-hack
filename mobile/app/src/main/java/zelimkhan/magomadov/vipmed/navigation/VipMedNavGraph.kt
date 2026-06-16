package zelimkhan.magomadov.vipmed.navigation

import androidx.compose.animation.AnimatedContentTransitionScope
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.runtime.Composable
import android.widget.Toast
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.Alignment
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import dev.chrisbanes.haze.hazeSource
import dev.chrisbanes.haze.rememberHazeState
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navOptions
import androidx.navigation.NavGraph.Companion.findStartDestination
import zelimkhan.magomadov.vipmed.R
import org.koin.androidx.compose.koinViewModel
import zelimkhan.magomadov.vipmed.core.ui.ObserveAsEvents
import zelimkhan.magomadov.vipmed.core.ui.VipBottomBar
import zelimkhan.magomadov.vipmed.features.app.AppointmentDetailsScreen
import zelimkhan.magomadov.vipmed.features.app.AppointmentsScreen
import zelimkhan.magomadov.vipmed.features.app.AuthScreen
import zelimkhan.magomadov.vipmed.features.app.BookingConfirmScreen
import zelimkhan.magomadov.vipmed.features.app.BookingDateTimeScreen
import zelimkhan.magomadov.vipmed.features.app.BookingDoctorScreen
import zelimkhan.magomadov.vipmed.features.app.BookingServiceScreen
import zelimkhan.magomadov.vipmed.features.app.BookingSuccessScreen
import zelimkhan.magomadov.vipmed.features.app.ChatScreen
import zelimkhan.magomadov.vipmed.features.app.DoctorDetailsScreen
import zelimkhan.magomadov.vipmed.features.app.DoctorsScreen
import zelimkhan.magomadov.vipmed.features.app.HomeScreen
import zelimkhan.magomadov.vipmed.features.app.LabResultsScreen
import zelimkhan.magomadov.vipmed.features.app.LeadRequestScreen
import zelimkhan.magomadov.vipmed.features.app.NotificationsScreen
import zelimkhan.magomadov.vipmed.features.app.OnboardingScreen
import zelimkhan.magomadov.vipmed.features.app.OtpScreen
import zelimkhan.magomadov.vipmed.features.app.ProfileScreen
import zelimkhan.magomadov.vipmed.features.app.ProfileSetupScreen
import zelimkhan.magomadov.vipmed.features.app.SplashScreen
import zelimkhan.magomadov.vipmed.features.app.StatesScreen
import zelimkhan.magomadov.vipmed.features.app.VipMedEvent
import zelimkhan.magomadov.vipmed.features.app.VipMedViewModel

@Composable
fun VipMedNavGraph(
    navController: NavHostController = rememberNavController(),
    viewModel: VipMedViewModel = koinViewModel(),
) {
    val state by viewModel.state.collectAsState()
    val context = LocalContext.current
    val hazeState = rememberHazeState()
    val backStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = backStackEntry?.destination?.route
    val bottomRoutes = setOf(
        VipMedRoute.Home.route,
        VipMedRoute.Appointments.route,
        VipMedRoute.Profile.route,
    )
    val showBottomBar = currentRoute in bottomRoutes

    ObserveAsEvents(flow = viewModel.event) { event ->
        when (event) {
            is VipMedEvent.Navigate -> navController.navigate(
                route = event.route,
                navOptions = navOptions {
                    launchSingleTop = true
                    if (event.clearBackStack) {
                        popUpTo(navController.graph.findStartDestination().id) {
                            inclusive = true
                        }
                    }
                },
            )

            VipMedEvent.NavigateBack -> navController.popBackStack()
            is VipMedEvent.ShowMessage ->
                Toast.makeText(context, event.message, Toast.LENGTH_SHORT).show()
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background),
    ) {
        NavHost(
            navController = navController,
            startDestination = VipMedRoute.Splash.route,
            modifier = Modifier
                .fillMaxSize()
                .hazeSource(hazeState),
            enterTransition = {
                slideIntoContainer(
                    towards = AnimatedContentTransitionScope.SlideDirection.Left,
                    animationSpec = tween(durationMillis = 280),
                )
            },
            exitTransition = {
                slideOutOfContainer(
                    towards = AnimatedContentTransitionScope.SlideDirection.Left,
                    animationSpec = tween(durationMillis = 280),
                )
            },
            popEnterTransition = {
                slideIntoContainer(
                    towards = AnimatedContentTransitionScope.SlideDirection.Right,
                    animationSpec = tween(durationMillis = 240),
                )
            },
            popExitTransition = {
                slideOutOfContainer(
                    towards = AnimatedContentTransitionScope.SlideDirection.Right,
                    animationSpec = tween(durationMillis = 240),
                )
            },
        ) {
            composable(route = VipMedRoute.Splash.route) {
                SplashScreen(
                    state = state.splash,
                    onEvent = viewModel::onSplashEvent,
                )
            }
            composable(route = VipMedRoute.Onboarding.route) {
                OnboardingScreen(
                    state = state.onboarding,
                    onEvent = viewModel::onOnboardingEvent,
                )
            }
            composable(route = VipMedRoute.Auth.route) {
                AuthScreen(
                    state = state.auth,
                    onEvent = viewModel::onAuthEvent,
                )
            }
            composable(route = VipMedRoute.Otp.route) {
                OtpScreen(
                    state = state.otp,
                    onEvent = viewModel::onOtpEvent,
                )
            }
            composable(route = VipMedRoute.ProfileSetup.route) {
                ProfileSetupScreen(
                    state = state.profileSetup,
                    onEvent = viewModel::onProfileSetupEvent,
                )
            }
            composable(route = VipMedRoute.LeadRequest.route) {
                LeadRequestScreen(
                    state = state.leadRequest,
                    onEvent = viewModel::onLeadRequestEvent,
                )
            }
            composable(route = VipMedRoute.Home.route) {
                HomeScreen(
                    state = state.home,
                    onEvent = viewModel::onHomeEvent,
                    onBottomRouteClick = navController::navigateBottomRoute,
                )
            }
            composable(route = VipMedRoute.BookingService.route) {
                BookingServiceScreen(
                    state = state.booking,
                    onEvent = viewModel::onBookingEvent,
                )
            }
            composable(route = VipMedRoute.BookingDoctor.route) {
                BookingDoctorScreen(
                    state = state.booking,
                    onEvent = viewModel::onBookingEvent,
                )
            }
            composable(route = VipMedRoute.BookingDateTime.route) {
                BookingDateTimeScreen(
                    state = state.booking,
                    onEvent = viewModel::onBookingEvent,
                )
            }
            composable(route = VipMedRoute.BookingConfirm.route) {
                BookingConfirmScreen(
                    state = state.booking,
                    onEvent = viewModel::onBookingEvent,
                )
            }
            composable(route = VipMedRoute.BookingSuccess.route) {
                BookingSuccessScreen(
                    state = state.booking,
                    onEvent = viewModel::onBookingEvent,
                )
            }
            composable(route = VipMedRoute.Appointments.route) {
                AppointmentsScreen(
                    state = state.appointments,
                    onEvent = viewModel::onAppointmentsEvent,
                    onBottomRouteClick = navController::navigateBottomRoute,
                )
            }
            composable(route = VipMedRoute.AppointmentDetails.route) {
                AppointmentDetailsScreen(
                    state = state.appointmentDetails,
                    onEvent = viewModel::onAppointmentDetailsEvent,
                )
            }
            composable(route = VipMedRoute.Doctors.route) {
                DoctorsScreen(
                    state = state.doctors,
                    onEvent = viewModel::onDoctorsEvent,
                    onBottomRouteClick = navController::navigateBottomRoute,
                )
            }
            composable(route = VipMedRoute.DoctorDetails.route) {
                DoctorDetailsScreen(
                    state = state.doctorDetails,
                    onEvent = viewModel::onDoctorDetailsEvent,
                )
            }
            composable(route = VipMedRoute.Chat.route) {
                ChatScreen(
                    state = state.chat,
                    onEvent = viewModel::onChatEvent,
                    onLoadChat = viewModel::loadChatForAppointment,
                )
            }
            composable(route = VipMedRoute.Notifications.route) {
                NotificationsScreen(
                    state = state.notifications,
                    onEvent = viewModel::onNotificationsEvent,
                )
            }
            composable(route = VipMedRoute.Profile.route) {
                ProfileScreen(
                    state = state.profile,
                    onEvent = viewModel::onProfileEvent,
                    onBottomRouteClick = navController::navigateBottomRoute,
                )
            }
            composable(route = VipMedRoute.LabResults.route) {
                LabResultsScreen(
                    state = state.labResults,
                    onEvent = viewModel::onLabResultsEvent,
                )
            }
            composable(route = VipMedRoute.States.route) {
                StatesScreen(
                    state = state.states,
                    onEvent = viewModel::onStatesEvent,
                )
            }
        }

        if (showBottomBar && currentRoute != null) {
            VipBottomBar(
                hazeState = hazeState,
                selectedRoute = currentRoute,
                labels = listOf(
                    stringResource(R.string.nav_home),
                    stringResource(R.string.nav_appointments),
                    stringResource(R.string.nav_profile),
                ),
                onRouteClick = navController::navigateBottomRoute,
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .height(IntrinsicSize.Min)
                    .padding(start = 24.dp, end = 24.dp, bottom = 20.dp),
            )
        }
    }
}

private fun NavHostController.navigateBottomRoute(route: String) {
    navigate(route = route) {
        launchSingleTop = true
        restoreState = true
        popUpTo(graph.findStartDestination().id) {
            saveState = true
        }
    }
}
