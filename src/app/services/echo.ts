import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
  interface Window {
    Pusher: any;
    Echo: any;
  }
}

@Injectable({
  providedIn: 'root',
})
export class EchoService {
  private echo: any | null = null;

  constructor(private http: HttpClient) {}

  initEcho(): any {
    if (this.echo) {
      return this.echo;
    }

    window.Pusher = Pusher;

    this.echo = new Echo({
      broadcaster: 'reverb',
      key: 'cogcc5ciyzbgrcgegh02', // Should match REVERB_APP_KEY in .env
      authorizer: (channel, options) => {
        return {
          authorize: (socketId, callback) => {
            this.http
              .post(
                'http://localhost:8000/api/broadcasting/auth',
                {
                  socket_id: socketId,
                  channel_name: channel.name,
                },
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem(
                      'auth_token'
                    )}`,
                    'Content-Type': 'application/json',
                  },
                }
              )
              .subscribe({
                next: (response: any) => {
                  callback(null, response);
                },
                error: (error: any) => {
                  callback(null, error);
                },
              });
          },
        };
      },
      wsHost: window.location.hostname,
      wsPort: 8080,
      wssPort: 8080,
      forceTLS: false,
      enabledTransports: ['ws', 'wss'],
    });
    return this.echo;
  }

  getEcho(): any {
    return this.echo || this.initEcho();
  }

  disconnect() {
    if (this.echo) {
      this.echo.disconnect();
      this.echo = null;
    }
  }
}
