package zelimkhan.magomadov.vipmed.features.app

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.AttachFile
import androidx.compose.material.icons.rounded.CheckCircle
import androidx.compose.material.icons.rounded.DoneAll
import androidx.compose.material.icons.rounded.ErrorOutline
import androidx.compose.material.icons.rounded.EventAvailable
import androidx.compose.material.icons.rounded.Notifications
import androidx.compose.material.icons.rounded.Phone
import androidx.compose.material.icons.rounded.Send
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import zelimkhan.magomadov.vipmed.R
import zelimkhan.magomadov.vipmed.core.common.ScreenStatus
import zelimkhan.magomadov.vipmed.core.ui.InfoChip
import zelimkhan.magomadov.vipmed.core.ui.ListCard
import zelimkhan.magomadov.vipmed.core.ui.StatePanel
import zelimkhan.magomadov.vipmed.core.ui.VipTopBar
import zelimkhan.magomadov.vipmed.ui.theme.VipMedTheme

@Composable
fun ChatScreen(
    state: ChatState,
    onEvent: (ChatEvent) -> Unit,
    onLoadChat: () -> Unit = {},
    modifier: Modifier = Modifier,
) {
    LaunchedEffect(Unit) {
        onLoadChat()
    }

    Scaffold(
        modifier = modifier,
        topBar = {
            VipTopBar(
                title = state.doctorName.ifEmpty { stringResource(R.string.chat_title) },
                onBackClick = { onEvent(ChatEvent.BackClick) },
                actionIcon = Icons.Rounded.Phone,
                onActionClick = { onEvent(ChatEvent.CallClick) },
            )
        },
        bottomBar = {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(10.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                IconButton(onClick = {}) {
                    Icon(imageVector = Icons.Rounded.AttachFile, contentDescription = null)
                }
                OutlinedTextField(
                    value = state.message,
                    onValueChange = { onEvent(ChatEvent.MessageChanged(message = it)) },
                    modifier = Modifier.weight(1f),
                    placeholder = { Text(text = stringResource(R.string.message_hint)) },
                    singleLine = true,
                )
                IconButton(onClick = { onEvent(ChatEvent.SendClick) }) {
                    Icon(imageVector = Icons.Rounded.Send, contentDescription = null)
                }
            }
        },
    ) { innerPadding ->
        when (state.status) {
            ScreenStatus.Loading -> {
                Box(
                    modifier = Modifier.fillMaxSize().padding(innerPadding),
                    contentAlignment = Alignment.Center,
                ) {
                    CircularProgressIndicator()
                }
            }

            else -> {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(innerPadding),
                    contentPadding = androidx.compose.foundation.layout.PaddingValues(12.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    if (state.messages.isEmpty()) {
                        item {
                            InfoChip(
                                text = "Начните диалог с врачом",
                                icon = Icons.Rounded.CheckCircle,
                            )
                        }
                    } else {
                        items(state.messages) { msg ->
                            MessageBubble(
                                text = msg.content,
                                isMine = msg.senderRole == "PATIENT",
                            )
                        }
                    }
                    item {
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            InfoChip(text = stringResource(R.string.chat_quick_book))
                            InfoChip(text = stringResource(R.string.chat_quick_move))
                            InfoChip(text = stringResource(R.string.chat_quick_thanks))
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun NotificationsScreen(
    state: NotificationsState,
    onEvent: (NotificationsEvent) -> Unit,
    modifier: Modifier = Modifier,
) {
    LaunchedEffect(Unit) {
        onEvent(NotificationsEvent.ScreenOpened)
    }

    Scaffold(
        modifier = modifier,
        topBar = {
            VipTopBar(
                title = stringResource(R.string.notifications_title),
                onBackClick = { onEvent(NotificationsEvent.BackClick) },
                actionIcon = Icons.Rounded.DoneAll,
                onActionClick = { onEvent(NotificationsEvent.MarkAllReadClick) },
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
            when (state.status) {
                ScreenStatus.Loading -> {
                    item {
                        Box(
                            modifier = Modifier.fillMaxWidth().padding(32.dp),
                            contentAlignment = Alignment.Center,
                        ) {
                            CircularProgressIndicator()
                        }
                    }
                }

                else -> {
                    if (state.notifications.isEmpty()) {
                        item {
                            Text(
                                text = "Нет уведомлений",
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.padding(16.dp),
                            )
                        }
                    } else {
                        items(state.notifications) { notification ->
                            val icon = when (notification.notificationType) {
                                "APPOINTMENT_CONFIRMED", "APPOINTMENT_REMINDER" -> Icons.Rounded.EventAvailable
                                "RESULTS_READY" -> Icons.Rounded.Notifications
                                else -> Icons.Rounded.Notifications
                            }
                            ListCard(
                                title = notification.title,
                                subtitle = notification.body.ifEmpty { notification.createdAt.take(10) },
                                leadingIcon = icon,
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun StatesScreen(
    state: StatesState,
    onEvent: (StatesEvent) -> Unit,
    modifier: Modifier = Modifier,
) {
    Scaffold(
        modifier = modifier,
        topBar = {
            VipTopBar(
                title = stringResource(R.string.states_title),
                onBackClick = { onEvent(StatesEvent.BackClick) },
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
                Text(
                    text = stringResource(R.string.states_subtitle),
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            item {
                StatePanel(
                    title = stringResource(R.string.loading_state),
                    subtitle = stringResource(R.string.loading_state_desc),
                )
            }
            item {
                StatePanel(
                    title = stringResource(R.string.empty_state),
                    subtitle = stringResource(R.string.empty_state_desc),
                )
            }
            item {
                StatePanel(
                    title = stringResource(R.string.error_state),
                    subtitle = stringResource(R.string.error_state_desc),
                    isError = true,
                )
            }
            item {
                StatePanel(
                    title = stringResource(R.string.success_state),
                    subtitle = stringResource(R.string.success_state_desc),
                )
            }
        }
    }
}

@Composable
private fun MessageBubble(
    text: String,
    isMine: Boolean,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = if (isMine) Arrangement.End else Arrangement.Start,
    ) {
        Card(
            modifier = Modifier.fillMaxWidth(0.76f),
            colors = CardDefaults.cardColors(
                containerColor = if (isMine) {
                    MaterialTheme.colorScheme.primaryContainer
                } else {
                    MaterialTheme.colorScheme.surfaceContainerLow
                },
            ),
        ) {
            Text(
                text = text,
                modifier = Modifier.padding(12.dp),
                style = MaterialTheme.typography.bodyMedium,
            )
        }
    }
}

@Composable
private fun SectionText(text: String) {
    Text(
        text = text,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
        style = MaterialTheme.typography.titleSmall,
        fontWeight = FontWeight.Bold,
    )
}

@Preview(showSystemUi = true)
@Composable
private fun ChatScreenPreview() {
    VipMedTheme(dynamicColor = false) {
        ChatScreen(
            state = ChatState(status = ScreenStatus.Success),
            onEvent = {},
        )
    }
}
