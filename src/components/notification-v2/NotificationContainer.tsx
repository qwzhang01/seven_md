import { useNotificationStore } from '../../stores'
import { NotificationItem } from './NotificationItem'

export function NotificationContainer() {
  const { notifications } = useNotificationStore()

  return (
    <div
      className="fixed z-[10001] flex flex-col gap-2"
      style={{ bottom: '40px', right: '16px' }}
      aria-live="polite"
      aria-label="通知"
    >
      {[...notifications].reverse().map((notif) => (
        <NotificationItem key={notif.id} notification={notif} />
      ))}
    </div>
  )
}
