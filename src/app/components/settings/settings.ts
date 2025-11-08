import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Auth } from '../../services/auth';
import { MatCheckbox } from '@angular/material/checkbox';
import {
  ProfileService,
  UserProfile,
  UserSettings,
} from '../../services/profile';
import { MatSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatCheckbox,
    MatSpinner
  ],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css'],
})
export class SettingsComponent implements OnInit {
  // User Profile
  userProfile = {
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  // Notification Settings
  notificationSettings = {
    emailNotifications: true,
    pushNotifications: false,
    jobAlerts: true,
    applicationUpdates: true,
    interviewReminders: true,
    newsletter: false,
  };

  // Privacy Settings
  privacySettings = {
    profileVisibility: 'public', // public, private, connections
    showEmail: false,
    showPhone: false,
    allowMessages: true,
    dataSharing: false,
  };

  // Preferences
  preferences = {
    jobType: ['remote', 'hybrid'], // remote, onsite, hybrid
    industries: ['Technology', 'Software Development'],
    salaryRange: { min: 50000, max: 120000 },
    location: '',
    language: 'en',
    timezone: 'UTC',
    currency: 'USD',
  };

  // Available options
  jobTypes = ['remote', 'onsite', 'hybrid'];
  industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Manufacturing',
    'Retail',
    'Marketing',
    'Other',
  ];
  languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
  ];
  timezones = ['UTC', 'EST', 'PST', 'CET', 'IST'];
  currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];

  loading = false;
  profileLoading = false;
  passwordLoading = false;
  notificationsLoading = false;

  constructor(
    private authService: Auth,
    private profileService: ProfileService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    this.loading = true;

    this.profileService.getProfile().subscribe({
      next: (response) => {
        // Update user profile from API
        this.userProfile.name = response.user.name || '';
        this.userProfile.email = response.user.email || '';
        this.userProfile.phone = response.user.phone || '';
        this.userProfile.location = response.user.location || '';
        this.userProfile.bio = response.user.bio || '';

        const settings = JSON.parse(response.settings as unknown as string)
        this.privacySettings = settings.privacy
        this.notificationSettings = settings.notifications
        this.preferences = settings.preferences

        // Update settings from API
        if (response.settings) {
          this.updateSettingsFromApi(response.settings);
        }

        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load profile:', error);
        this.showError('Failed to load profile data');
        this.loading = false;
      },
    });
  }

  updateSettingsFromApi(apiSettings: UserSettings): void {
    // Update notification settings
    if (apiSettings.notifications) {
      this.notificationSettings = {
        emailNotifications: apiSettings.notifications.emailNotifications ?? true,
        pushNotifications: apiSettings.notifications.pushNotifications ?? false,
        jobAlerts: apiSettings.notifications.jobAlerts ?? true,
        applicationUpdates:
          apiSettings.notifications.applicationUpdates ?? true,
        interviewReminders:
          apiSettings.notifications.interviewReminders ?? true,
        newsletter: apiSettings.notifications.newsletter ?? false,
      };
    }

    // Update privacy settings
    if (apiSettings.privacy) {
      this.privacySettings = {
        profileVisibility: apiSettings.privacy.profileVisibility || 'public',
        showEmail: apiSettings.privacy.showEmail ?? false,
        showPhone: apiSettings.privacy.showPhone ?? false,
        allowMessages: apiSettings.privacy.allowMessages ?? true,
        dataSharing: apiSettings.privacy.dataSharing ?? false,
      };
    }

    // Update preferences
    if (apiSettings.preferences) {
      this.preferences = {
        jobType: apiSettings.preferences.jobType || ['remote', 'hybrid'],
        industries: apiSettings.preferences.industries || ['Technology'],
        salaryRange: apiSettings.preferences.salaryRange || {
          min: 50000,
          max: 120000,
        },
        location: apiSettings.preferences.location || '',
        language: apiSettings.preferences.language || 'en',
        timezone: apiSettings.preferences.timezone || 'UTC',
        currency: apiSettings.preferences.currency || 'USD',
      };
    }
  }

  loadStoredSettings(): void {
    // Load notification settings
    const storedNotifications = localStorage.getItem('notificationSettings');
    if (storedNotifications) {
      this.notificationSettings = {
        ...this.notificationSettings,
        ...JSON.parse(storedNotifications),
      };
    }

    // Load privacy settings
    const storedPrivacy = localStorage.getItem('privacySettings');
    if (storedPrivacy) {
      this.privacySettings = {
        ...this.privacySettings,
        ...JSON.parse(storedPrivacy),
      };
    }

    // Load preferences
    const storedPreferences = localStorage.getItem('userPreferences');
    if (storedPreferences) {
      this.preferences = {
        ...this.preferences,
        ...JSON.parse(storedPreferences),
      };
    }
  }

  saveProfile(): void {
    this.profileLoading = true;

    const profileData = {
      name: this.userProfile.name,
      email: this.userProfile.email,
      phone: this.userProfile.phone,
      location: this.userProfile.location,
      bio: this.userProfile.bio,
    };

    this.profileService.updateProfile(profileData).subscribe({
      next: (response) => {
        this.profileLoading = false;

        // Update local user data in auth service
        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
          currentUser.name = response.user.name;
          currentUser.email = response.user.email;
          currentUser.phone = response.user.phone;
          currentUser.location = response.user.location;
          currentUser.bio = response.user.bio;
        }

        this.showSuccess('Profile updated successfully');
      },
      error: (error) => {
        this.profileLoading = false;
        console.error('Failed to update profile:', error);

        if (error.error && error.error.errors) {
          const errorMessages = Object.values(error.error.errors).flat();
          this.showError(errorMessages.join(', '));
        } else {
          this.showError('Failed to update profile. Please try again.');
        }
      },
    });
  }

  changePassword(): void {
    // Validation
    if (!this.userProfile.currentPassword) {
      this.showError('Current password is required');
      return;
    }

    if (!this.userProfile.newPassword) {
      this.showError('New password is required');
      return;
    }

    if (this.userProfile.newPassword !== this.userProfile.confirmPassword) {
      this.showError('New passwords do not match');
      return;
    }

    if (this.userProfile.newPassword.length < 8) {
      this.showError('Password must be at least 8 characters long');
      return;
    }

    this.passwordLoading = true;

    const passwordData = {
      current_password: this.userProfile.currentPassword,
      new_password: this.userProfile.newPassword,
      new_password_confirmation: this.userProfile.confirmPassword,
    };

    this.profileService.changePassword(passwordData).subscribe({
      next: (response) => {
        this.passwordLoading = false;

        // Clear password fields
        this.userProfile.currentPassword = '';
        this.userProfile.newPassword = '';
        this.userProfile.confirmPassword = '';

        this.showSuccess('Password changed successfully');
      },
      error: (error) => {
        this.passwordLoading = false;
        console.error('Failed to change password:', error);

        if (error.error && error.error.errors) {
          const errorMessages = Object.values(error.error.errors).flat();
          this.showError(errorMessages.join(', '));
        } else if (error.error && error.error.message) {
          this.showError(error.error.message);
        } else {
          this.showError('Failed to change password. Please try again.');
        }
      },
    });
  }

  onNotificationChange(): void {
    // Auto-save when any notification setting changes
    this.saveNotificationSettings();
  }

  saveNotificationSettings(): void {
    this.notificationsLoading = true;

    const settingsData = {
      notifications: this.notificationSettings,
    };

    this.profileService.updateSettings(settingsData).subscribe({
      next: (response) => {
        this.notificationsLoading = false;
        this.showSuccess('Notification settings updated successfully');
      },
      error: (error) => {
        this.notificationsLoading = false;
        console.error('Failed to update notification settings:', error);

        if (error.error && error.error.errors) {
          const errorMessages = Object.values(error.error.errors).flat();
          this.showError(errorMessages.join(', '));
        } else {
          this.showError(
            'Failed to update notification settings. Please try again.'
          );
        }
      },
    });
  }

  savePrivacySettings(): void {
    const settingsData = {
      privacy: this.privacySettings,
    };

    this.profileService.updateSettings(settingsData).subscribe({
      next: (response) => {
        this.showSuccess('Privacy settings updated successfully');
      },
      error: (error) => {
        console.error('Failed to update privacy settings:', error);

        if (error.error && error.error.errors) {
          const errorMessages = Object.values(error.error.errors).flat();
          this.showError(errorMessages.join(', '));
        } else {
          this.showError(
            'Failed to update privacy settings. Please try again.'
          );
        }
      },
    });
  }
  
  savePreferences(): void {
    const settingsData = {
      preferences: this.preferences,
    };

    this.profileService.updateSettings(settingsData).subscribe({
      next: (response) => {
        this.showSuccess('Preferences updated successfully');
      },
      error: (error) => {
        console.error('Failed to update preferences:', error);

        if (error.error && error.error.errors) {
          const errorMessages = Object.values(error.error.errors).flat();
          this.showError(errorMessages.join(', '));
        } else {
          this.showError('Failed to update preferences. Please try again.');
        }
      },
    });
  }

 onJobTypeChange(jobType: string, event: any): void {
    if (event.checked) {
      if (!this.preferences.jobType.includes(jobType)) {
        this.preferences.jobType.push(jobType);
      }
    } else {
      this.preferences.jobType = this.preferences.jobType.filter(type => type !== jobType);
    }
  }

  onIndustryChange(industry: string, event: any): void {
    if (event.checked) {
      if (!this.preferences.industries.includes(industry)) {
        this.preferences.industries.push(industry);
      }
    } else {
      this.preferences.industries = this.preferences.industries.filter(ind => ind !== industry);
    }
  }

  exportData(): void {
    this.profileService.exportData().subscribe({
      next: (response) => {
        const dataStr = JSON.stringify(response.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `user-data-${new Date().getTime()}.json`;
        link.click();

        this.showSuccess('Data exported successfully');
      },
      error: (error) => {
        console.error('Failed to export data:', error);

        // Fallback to local data export
        const userData = {
          profile: this.userProfile,
          notifications: this.notificationSettings,
          privacy: this.privacySettings,
          preferences: this.preferences,
          exportDate: new Date().toISOString(),
        };

        const dataStr = JSON.stringify(userData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `user-data-local-${new Date().getTime()}.json`;
        link.click();

        this.showSuccess('Data exported (local data only)');
      },
    });
  }

  deleteAccount(): void {
    const password = prompt(
      'Please enter your password to confirm account deletion:'
    );

    if (!password) {
      return;
    }

    const confirmation = confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    if (confirmation) {
      this.loading = true;

      this.profileService.deleteAccount(password).subscribe({
        next: (response) => {
          this.loading = false;
          this.authService.logout();
          this.router.navigate(['/login']);
          this.showSuccess('Account deleted successfully');
        },
        error: (error) => {
          this.loading = false;
          console.error('Failed to delete account:', error);

          if (error.error && error.error.message) {
            this.showError(error.error.message);
          } else {
            this.showError('Failed to delete account. Please try again.');
          }
        },
      });
    }
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar'],
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar'],
    });
  }
}
