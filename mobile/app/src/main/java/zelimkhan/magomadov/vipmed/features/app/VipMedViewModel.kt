package zelimkhan.magomadov.vipmed.features.app

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import zelimkhan.magomadov.vipmed.core.common.ScreenStatus
import zelimkhan.magomadov.vipmed.core.network.*
import zelimkhan.magomadov.vipmed.navigation.VipMedRoute

class VipMedViewModel(
    private val apiService: ApiService,
    private val tokenManager: TokenManager,
) : ViewModel() {
    private val _state = MutableStateFlow(VipMedState())
    val state: StateFlow<VipMedState> = _state.asStateFlow()

    private val _event = Channel<VipMedEvent>()
    val event = _event.receiveAsFlow()

    // ── Splash ───────────────────────────────────────────────────────

    fun onSplashEvent(event: SplashEvent) {
        when (event) {
            SplashEvent.Started -> checkAuthAndNavigate()
        }
    }

    private fun checkAuthAndNavigate() {
        viewModelScope.launch {
            delay(timeMillis = 900)
            if (tokenManager.isLoggedIn()) {
                navigate(route = VipMedRoute.Home.route, clearBackStack = true)
            } else {
                navigate(route = VipMedRoute.Onboarding.route, clearBackStack = true)
            }
        }
    }

    // ── Onboarding ───────────────────────────────────────────────────

    fun onOnboardingEvent(event: OnboardingEvent) {
        when (event) {
            OnboardingEvent.ContinueClick -> navigate(
                route = VipMedRoute.Auth.route,
                clearBackStack = true,
            )
        }
    }

    // ── Auth ─────────────────────────────────────────────────────────

    fun onAuthEvent(event: AuthEvent) {
        when (event) {
            is AuthEvent.PhoneChanged -> _state.update {
                it.copy(auth = it.auth.copy(phone = event.phone, error = null))
            }

            AuthEvent.ContinueClick -> sendOtp()
        }
    }

    private fun sendOtp() {
        val phone = _state.value.auth.phone.trim()
        if (phone.isEmpty()) return

        _state.update { it.copy(auth = it.auth.copy(isLoading = true, error = null)) }

        viewModelScope.launch {
            try {
                apiService.sendOtp(SendOtpRequest(phone = phone))
                _state.update { it.copy(auth = it.auth.copy(isLoading = false)) }
                navigate(route = VipMedRoute.Otp.route)
            } catch (e: Exception) {
                _state.update {
                    it.copy(auth = it.auth.copy(isLoading = false, error = e.message))
                }
            }
        }
    }

    // ── OTP ──────────────────────────────────────────────────────────

    fun onOtpEvent(event: OtpEvent) {
        when (event) {
            OtpEvent.BackClick -> navigateBack()
            is OtpEvent.CodeChanged -> _state.update {
                it.copy(otp = it.otp.copy(code = event.code.take(6), hasError = false, errorMessage = null))
            }

            OtpEvent.ContinueClick -> verifyOtp()
        }
    }

    private fun verifyOtp() {
        val phone = _state.value.auth.phone.trim()
        val code = _state.value.otp.code.trim()
        if (code.length < 6) return

        _state.update { it.copy(otp = it.otp.copy(isLoading = true, hasError = false)) }

        viewModelScope.launch {
            try {
                val response = apiService.verifyOtp(VerifyOtpRequest(phone = phone, code = code))
                tokenManager.saveToken(response.token)
                tokenManager.savePatientId(response.patientId)
                _state.update { it.copy(otp = it.otp.copy(isLoading = false)) }

                if (response.isProfileComplete) {
                    navigate(route = VipMedRoute.Home.route, clearBackStack = true)
                } else {
                    navigate(route = VipMedRoute.ProfileSetup.route, clearBackStack = true)
                }
            } catch (e: Exception) {
                _state.update {
                    it.copy(
                        otp = it.otp.copy(
                            isLoading = false,
                            hasError = true,
                            errorMessage = e.message,
                        )
                    )
                }
            }
        }
    }

    // ── Profile Setup ────────────────────────────────────────────────

    fun onProfileSetupEvent(event: ProfileSetupEvent) {
        when (event) {
            ProfileSetupEvent.BackClick -> navigateBack()
            is ProfileSetupEvent.FirstNameChanged -> _state.update {
                it.copy(profileSetup = it.profileSetup.copy(firstName = event.name, error = null))
            }

            is ProfileSetupEvent.LastNameChanged -> _state.update {
                it.copy(profileSetup = it.profileSetup.copy(lastName = event.name, error = null))
            }

            is ProfileSetupEvent.BirthDateChanged -> _state.update {
                it.copy(profileSetup = it.profileSetup.copy(birthDate = event.date, error = null))
            }

            ProfileSetupEvent.SaveClick -> saveProfile()
        }
    }

    private fun saveProfile() {
        val setup = _state.value.profileSetup
        if (setup.firstName.isBlank() || setup.lastName.isBlank() || setup.birthDate.isBlank()) {
            _state.update {
                it.copy(
                    profileSetup = it.profileSetup.copy(
                        error = "Заполните имя, фамилию и дату рождения",
                    )
                )
            }
            return
        }

        _state.update { it.copy(profileSetup = it.profileSetup.copy(isLoading = true, error = null)) }

        viewModelScope.launch {
            try {
                apiService.updateProfile(
                    ProfileUpdateRequest(
                        firstName = setup.firstName.trim(),
                        lastName = setup.lastName.trim(),
                        birthDate = setup.birthDate,
                    )
                )
                _state.update { it.copy(profileSetup = it.profileSetup.copy(isLoading = false)) }
                navigate(route = VipMedRoute.Home.route, clearBackStack = true)
            } catch (e: Exception) {
                _state.update {
                    it.copy(
                        profileSetup = it.profileSetup.copy(
                            isLoading = false,
                            error = "Не удалось сохранить. Попробуйте снова.",
                        )
                    )
                }
            }
        }
    }

    // ── Home ─────────────────────────────────────────────────────────

    fun onHomeEvent(event: HomeEvent) {
        when (event) {
            HomeEvent.AvatarClick -> navigate(route = VipMedRoute.Profile.route)
            HomeEvent.BookClick -> navigate(route = VipMedRoute.BookingService.route)
            HomeEvent.RequestCallClick -> navigate(route = VipMedRoute.LeadRequest.route)
            HomeEvent.ChatClick -> navigate(route = VipMedRoute.Chat.route)
            HomeEvent.LabResultsClick -> navigate(route = VipMedRoute.LabResults.route)
            HomeEvent.NotificationsClick -> navigate(route = VipMedRoute.Notifications.route)
            HomeEvent.ScreenOpened -> loadHomeData()
        }
    }

    private fun loadHomeData() {
        viewModelScope.launch {
            try {
                val profile = apiService.getProfile()
                val initials = "${profile.firstName.firstOrNull() ?: ""}${profile.lastName.firstOrNull() ?: ""}"
                val appointments = try {
                    apiService.getAppointments(period = "future")
                } catch (_: Exception) {
                    emptyList()
                }
                _state.update {
                    it.copy(
                        home = it.home.copy(
                            status = ScreenStatus.Success,
                            profileName = "${profile.firstName} ${profile.lastName}",
                            profileInitials = initials.uppercase(),
                            nearestAppointment = appointments.firstOrNull(),
                        )
                    )
                }
            } catch (e: Exception) {
                _state.update {
                    it.copy(home = it.home.copy(status = ScreenStatus.Error))
                }
            }
        }
    }

    // ── Booking ──────────────────────────────────────────────────────

    fun onBookingEvent(event: BookingEvent) {
        when (event) {
            BookingEvent.BackClick -> navigateBack()
            BookingEvent.ConfirmClick -> createAppointment()
            BookingEvent.DateNextClick -> {
                val b = _state.value.booking
                if (b.selectedDate.isNotBlank() && b.selectedTime.isNotBlank()) {
                    navigate(route = VipMedRoute.BookingConfirm.route)
                } else {
                    showMessage("Выберите дату и время")
                }
            }
            BookingEvent.DoctorNextClick -> {
                if (_state.value.booking.selectedDoctor != null) {
                    navigate(route = VipMedRoute.BookingDateTime.route)
                } else {
                    showMessage("Выберите врача")
                }
            }
            BookingEvent.DoneClick -> {
                _state.update { it.copy(booking = BookingState(status = ScreenStatus.Success)) }
                navigate(
                    route = VipMedRoute.Appointments.route,
                    clearBackStack = true,
                )
            }

            BookingEvent.ServiceNextClick -> {
                if (_state.value.booking.selectedService != null) {
                    navigate(route = VipMedRoute.BookingDoctor.route)
                }
            }

            BookingEvent.LoadServices -> loadServices()
            BookingEvent.LoadDoctors -> loadDoctorsForBooking()
            is BookingEvent.ServiceSelected -> _state.update {
                it.copy(booking = it.booking.copy(selectedService = event.service))
            }

            is BookingEvent.DoctorSelected -> _state.update {
                it.copy(booking = it.booking.copy(selectedDoctor = event.doctor))
            }

            is BookingEvent.DateSelected -> _state.update {
                it.copy(booking = it.booking.copy(selectedDate = event.date))
            }

            is BookingEvent.TimeSelected -> _state.update {
                it.copy(booking = it.booking.copy(selectedTime = event.time))
            }
        }
    }

    private fun loadServices() {
        viewModelScope.launch {
            try {
                val services = apiService.getServices()
                _state.update {
                    it.copy(
                        booking = it.booking.copy(
                            status = ScreenStatus.Success,
                            services = services,
                        )
                    )
                }
            } catch (e: Exception) {
                _state.update {
                    it.copy(booking = it.booking.copy(status = ScreenStatus.Error))
                }
            }
        }
    }

    private fun loadDoctorsForBooking() {
        viewModelScope.launch {
            try {
                val doctors = apiService.getDoctors()
                _state.update {
                    it.copy(
                        booking = it.booking.copy(
                            status = ScreenStatus.Success,
                            doctors = doctors,
                        )
                    )
                }
            } catch (e: Exception) {
                _state.update {
                    it.copy(booking = it.booking.copy(status = ScreenStatus.Error))
                }
            }
        }
    }

    private fun createAppointment() {
        val booking = _state.value.booking
        val doctor = booking.selectedDoctor ?: return
        val service = booking.selectedService ?: return
        if (booking.selectedDate.isBlank() || booking.selectedTime.isBlank()) {
            showMessage("Выберите дату и время")
            return
        }

        _state.update { it.copy(booking = it.booking.copy(isLoading = true)) }

        viewModelScope.launch {
            try {
                apiService.createAppointment(
                    CreateAppointmentRequest(
                        doctor = doctor.id,
                        date = booking.selectedDate,
                        startTime = booking.selectedTime,
                        endTime = computeEndTime(booking.selectedTime, service.durationMin),
                        service = service.id,
                    )
                )
                _state.update { it.copy(booking = it.booking.copy(isLoading = false)) }
                navigate(route = VipMedRoute.BookingSuccess.route)
            } catch (e: Exception) {
                _state.update {
                    it.copy(booking = it.booking.copy(isLoading = false))
                }
                showMessage("Не удалось создать запись. Попробуйте снова.")
            }
        }
    }

    private fun computeEndTime(start: String, durationMin: Int): String {
        return try {
            val duration = if (durationMin > 0) durationMin else 30
            java.time.LocalTime.parse(start).plusMinutes(duration.toLong()).toString().take(5)
        } catch (e: Exception) {
            start
        }
    }

    // ── Appointments ─────────────────────────────────────────────────

    fun onAppointmentsEvent(event: AppointmentsEvent) {
        when (event) {
            is AppointmentsEvent.DetailsClick -> {
                _state.update {
                    val appt = it.appointments.appointments.find { a -> a.id == event.appointmentId }
                    it.copy(appointmentDetails = AppointmentDetailsState(
                        status = ScreenStatus.Success,
                        appointment = appt,
                    ))
                }
                navigate(route = VipMedRoute.AppointmentDetails.route)
            }

            AppointmentsEvent.FilterClick -> Unit
            AppointmentsEvent.ScreenOpened -> loadAppointments()
            is AppointmentsEvent.PeriodChanged -> {
                _state.update {
                    it.copy(appointments = it.appointments.copy(selectedPeriod = event.period))
                }
                loadAppointments()
            }
        }
    }

    private fun loadAppointments() {
        viewModelScope.launch {
            _state.update {
                it.copy(appointments = it.appointments.copy(status = ScreenStatus.Loading))
            }
            try {
                val period = _state.value.appointments.selectedPeriod
                val appointments = apiService.getAppointments(period = period)
                _state.update {
                    it.copy(
                        appointments = it.appointments.copy(
                            status = ScreenStatus.Success,
                            appointments = appointments,
                        )
                    )
                }
            } catch (e: Exception) {
                _state.update {
                    it.copy(appointments = it.appointments.copy(status = ScreenStatus.Error))
                }
            }
        }
    }

    // ── Appointment Details ──────────────────────────────────────────

    fun onAppointmentDetailsEvent(event: AppointmentDetailsEvent) {
        when (event) {
            AppointmentDetailsEvent.BackClick -> navigateBack()
            AppointmentDetailsEvent.ChatClick -> {
                val appt = _state.value.appointmentDetails.appointment
                if (appt != null) {
                    _state.update {
                        it.copy(
                            chat = ChatState(
                                appointmentId = appt.id,
                                doctorName = "${appt.doctorDetail?.lastName ?: ""} ${appt.doctorDetail?.firstName ?: ""}".trim(),
                            )
                        )
                    }
                    navigate(route = VipMedRoute.Chat.route)
                }
            }
        }
    }

    // ── Doctors ──────────────────────────────────────────────────────

    fun onDoctorsEvent(event: DoctorsEvent) {
        when (event) {
            is DoctorsEvent.DoctorClick -> {
                val doctor = _state.value.doctors.doctors.find { it.id == event.doctorId }
                _state.update {
                    it.copy(
                        doctorDetails = DoctorDetailsState(
                            status = ScreenStatus.Success,
                            doctor = doctor,
                        )
                    )
                }
                navigate(route = VipMedRoute.DoctorDetails.route)
            }

            DoctorsEvent.FilterClick -> Unit
            DoctorsEvent.ScreenOpened -> loadDoctors()
            is DoctorsEvent.SearchChanged -> {
                _state.update {
                    it.copy(doctors = it.doctors.copy(searchQuery = event.query))
                }
                loadDoctors()
            }
        }
    }

    private fun loadDoctors() {
        viewModelScope.launch {
            try {
                val query = _state.value.doctors.searchQuery.takeIf { it.isNotBlank() }
                val doctors = apiService.getDoctors(search = query)
                _state.update {
                    it.copy(
                        doctors = it.doctors.copy(
                            status = ScreenStatus.Success,
                            doctors = doctors,
                        )
                    )
                }
            } catch (e: Exception) {
                _state.update {
                    it.copy(doctors = it.doctors.copy(status = ScreenStatus.Error))
                }
            }
        }
    }

    // ── Doctor Details ───────────────────────────────────────────────

    fun onDoctorDetailsEvent(event: DoctorDetailsEvent) {
        when (event) {
            DoctorDetailsEvent.BackClick -> navigateBack()
            DoctorDetailsEvent.BookClick -> navigate(route = VipMedRoute.BookingService.route)
        }
    }

    // ── Chat ─────────────────────────────────────────────────────────

    fun onChatEvent(event: ChatEvent) {
        when (event) {
            ChatEvent.BackClick -> navigateBack()
            ChatEvent.CallClick -> Unit
            is ChatEvent.MessageChanged -> _state.update {
                it.copy(chat = it.chat.copy(message = event.message))
            }

            ChatEvent.SendClick -> sendChatMessage()
        }
    }

    fun loadChatForAppointment() {
        viewModelScope.launch {
            try {
                val appointmentId = _state.value.chat.appointmentId
                val chatDetail = if (appointmentId != null) {
                    apiService.getChatByAppointment(appointmentId)
                } else {
                    // Чат открыт из нижней навигации без конкретной записи —
                    // показываем последний диалог, либо пустой экран.
                    val rooms = apiService.getChatList()
                    val latest = rooms.firstOrNull()
                    if (latest == null) {
                        _state.update {
                            it.copy(
                                chat = it.chat.copy(
                                    status = ScreenStatus.Success,
                                    messages = emptyList(),
                                )
                            )
                        }
                        return@launch
                    }
                    apiService.getChatDetail(latest.id)
                }
                _state.update {
                    it.copy(
                        chat = it.chat.copy(
                            status = ScreenStatus.Success,
                            chatId = chatDetail.id,
                            doctorName = chatDetail.doctorName,
                            messages = chatDetail.messages,
                        )
                    )
                }
            } catch (e: Exception) {
                _state.update {
                    it.copy(chat = it.chat.copy(status = ScreenStatus.Error))
                }
            }
        }
    }

    private fun sendChatMessage() {
        val chatId = _state.value.chat.chatId ?: return
        val content = _state.value.chat.message.trim()
        if (content.isEmpty()) return

        viewModelScope.launch {
            try {
                val newMessage = apiService.sendChatMessage(chatId, SendMessageRequest(content))
                _state.update {
                    it.copy(
                        chat = it.chat.copy(
                            message = "",
                            messages = it.chat.messages + newMessage,
                        )
                    )
                }
            } catch (_: Exception) {
                // silently fail
            }
        }
    }

    // ── Notifications ────────────────────────────────────────────────

    fun onNotificationsEvent(event: NotificationsEvent) {
        when (event) {
            NotificationsEvent.BackClick -> navigateBack()
            NotificationsEvent.MarkAllReadClick -> markAllNotificationsRead()
            NotificationsEvent.ScreenOpened -> loadNotifications()
        }
    }

    private fun loadNotifications() {
        viewModelScope.launch {
            try {
                val notifications = apiService.getNotifications()
                _state.update {
                    it.copy(
                        notifications = it.notifications.copy(
                            status = ScreenStatus.Success,
                            notifications = notifications,
                        )
                    )
                }
            } catch (e: Exception) {
                _state.update {
                    it.copy(notifications = it.notifications.copy(status = ScreenStatus.Error))
                }
            }
        }
    }

    private fun markAllNotificationsRead() {
        viewModelScope.launch {
            try {
                apiService.markAllNotificationsRead()
                _state.update {
                    it.copy(
                        notifications = it.notifications.copy(
                            notifications = it.notifications.notifications.map { n ->
                                n.copy(isRead = true)
                            }
                        )
                    )
                }
            } catch (_: Exception) { }
        }
    }

    // ── Profile ──────────────────────────────────────────────────────

    fun onProfileEvent(event: ProfileEvent) {
        when (event) {
            ProfileEvent.LabResultsClick -> navigate(route = VipMedRoute.LabResults.route)
            ProfileEvent.LogoutClick -> {
                tokenManager.clearToken()
                navigate(route = VipMedRoute.Auth.route, clearBackStack = true)
            }

            ProfileEvent.SettingsClick -> Unit
            ProfileEvent.ScreenOpened -> loadProfile()
        }
    }

    private fun loadProfile() {
        viewModelScope.launch {
            try {
                val profile = apiService.getProfile()
                _state.update {
                    it.copy(
                        profile = it.profile.copy(
                            status = ScreenStatus.Success,
                            profile = profile,
                        )
                    )
                }
            } catch (e: Exception) {
                _state.update {
                    it.copy(profile = it.profile.copy(status = ScreenStatus.Error))
                }
            }
        }
    }

    // ── Lab Results (hardcoded, skipped) ─────────────────────────────

    fun onLabResultsEvent(event: LabResultsEvent) {
        when (event) {
            LabResultsEvent.BackClick -> navigateBack()
            LabResultsEvent.CloseDetailsClick -> _state.update {
                it.copy(labResults = it.labResults.copy(showDetails = false))
            }

            LabResultsEvent.FilterClick -> Unit
            LabResultsEvent.ResultClick -> _state.update {
                it.copy(labResults = it.labResults.copy(showDetails = true))
            }
        }
    }

    // ── States ───────────────────────────────────────────────────────

    fun onStatesEvent(event: StatesEvent) {
        when (event) {
            StatesEvent.BackClick -> navigateBack()
        }
    }

    // ── Lead request (заявка на звонок) ──────────────────────────────

    fun onLeadRequestEvent(event: LeadRequestEvent) {
        when (event) {
            LeadRequestEvent.BackClick -> navigateBack()
            is LeadRequestEvent.NameChanged -> _state.update {
                it.copy(leadRequest = it.leadRequest.copy(name = event.name, error = null))
            }
            is LeadRequestEvent.PhoneChanged -> _state.update {
                it.copy(leadRequest = it.leadRequest.copy(phone = event.phone, error = null))
            }
            is LeadRequestEvent.CommentChanged -> _state.update {
                it.copy(leadRequest = it.leadRequest.copy(comment = event.comment))
            }
            LeadRequestEvent.SubmitClick -> submitLead()
            LeadRequestEvent.DoneClick -> {
                _state.update { it.copy(leadRequest = LeadRequestState()) }
                navigateBack()
            }
        }
    }

    private fun submitLead() {
        val lead = _state.value.leadRequest
        if (lead.name.isBlank() || lead.phone.isBlank()) {
            _state.update {
                it.copy(leadRequest = it.leadRequest.copy(error = "Укажите имя и телефон"))
            }
            return
        }

        _state.update { it.copy(leadRequest = it.leadRequest.copy(isLoading = true, error = null)) }

        viewModelScope.launch {
            try {
                apiService.createLead(
                    CreateLeadRequest(
                        firstName = lead.name.trim(),
                        phone = lead.phone.trim(),
                        notes = lead.comment.trim(),
                        channel = "OTHER",
                    )
                )
                _state.update {
                    it.copy(
                        leadRequest = it.leadRequest.copy(
                            isLoading = false,
                            isSubmitted = true,
                        )
                    )
                }
            } catch (e: Exception) {
                _state.update {
                    it.copy(
                        leadRequest = it.leadRequest.copy(
                            isLoading = false,
                            error = "Не удалось отправить заявку. Попробуйте снова.",
                        )
                    )
                }
            }
        }
    }

    // ── Navigation helpers ───────────────────────────────────────────

    private fun showMessage(message: String) {
        viewModelScope.launch {
            _event.send(VipMedEvent.ShowMessage(message = message))
        }
    }

    private fun navigate(route: String, clearBackStack: Boolean = false) {
        viewModelScope.launch {
            _event.send(
                VipMedEvent.Navigate(
                    route = route,
                    clearBackStack = clearBackStack,
                )
            )
        }
    }

    private fun navigateBack() {
        viewModelScope.launch {
            _event.send(VipMedEvent.NavigateBack)
        }
    }
}
