// app/dashboard/settings/page.tsx
import { redirect } from 'next/navigation';

export default function SettingsBasePage() {
    // Automatically redirect to the profile tab
    redirect('/settings/profile');
}