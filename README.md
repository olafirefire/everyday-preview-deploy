# Everyday v1.5 — Phone reminder pilot

This is an independent, early Everyday UX preview. It does not contain HeartOS, JobOS or SpiritOS clinical or private records.

## Quick test on a phone
1. Open https://everyday-mobile-preview.onrender.com
2. Say or paste: `Leadership class on Saturday 21 November 2026 at 8pm WAT. Remind me.`
3. Check and confirm the event, then tap **Google Calendar** or **Other calendars**.
4. Import/save that calendar event and make sure calendar notifications are allowed.
5. In Everyday, open **Set up alerts**, enable device alerts, and try the test notification.
6. Open **Everything**, try **Snooze**, **Done** and **Correct details**.

## Notification truth
- Calendar export requests event alerts 1 day, 1 hour, 10 minutes before, and at the start. Your calendar app may honor or adjust these; check your event after importing.
- **Everyday device alerts currently work only while Everyday is active and notification permission is granted**. They are deduplicated, and can be snoozed 10 minutes. The service worker is prepared for future authenticated Web Push.
- **Everyday does not yet provide dependable background push when the app or browser is closed.** That requires a dedicated always-on scheduler with durable storage, user accounts and device subscriptions. No misleading promise is made.
- If you use Google Calendar, verify its event alert settings; the link creates an event draft but cannot guarantee the custom .ics alert schedule.
- Trial records remain encrypted in the browser on each device, without sync or backup. Clearing site data can lose them. Use fictional or nonsensitive records for this public preview.
- Don't use this preview as your sole reminder for urgent appointments.

## Technical controls
Static PWA on HTTPS, IndexedDB local encrypted records, audit log, service worker and local notification permission on user gesture. Separate, privately held source repository and public static-only deployment repository. No keys, personal data or backend included in the public repository.

Future production notification system: opt-in push subscription, opaque device and record identifiers, PostgreSQL job store, an always-on scheduled dispatcher, idempotent delivery attempts with retries and dead-letter queue, revalidation after edits, quiet hours where requested, notification receipts, multi-device sync, and encrypted message contents. NDPA governance and user deletion mechanisms required before production.
