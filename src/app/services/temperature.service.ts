import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TemperatureService {
  private arrayDataPath = 'data/temperature-array.json';

  constructor(private http: HttpClient) { }

  getTemperatureArray(): Observable<any[]> {
    return this.http.get<any[]>(this.arrayDataPath);
  }

  getTemperatureFromAPI(deviceId: string): Observable<any> {
    return this.http.get(`/api/temperature/${deviceId}`);
  }

  subscribeToRealTimeData(deviceId: string): Observable<any> {
    return new Observable(observer => {
      // Validate deviceId to prevent injection
      if (!deviceId || !/^[a-zA-Z0-9\-_]+$/.test(deviceId)) {
        observer.error(new Error('Invalid device ID'));
        return () => {};
      }

      try {
        const socket = new WebSocket(`wss://api.example.com/temp/${deviceId}`);

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            // Validate data structure before emitting
            if (this.isValidTemperatureData(data)) {
              observer.next(data);
            } else {
              console.warn('Invalid data structure received from WebSocket');
            }
          } catch (error) {
            console.error('Failed to parse WebSocket data', error);
          }
        };

        socket.onerror = (error) => observer.error(error);
        socket.onclose = () => observer.complete();

        return () => socket.close();
      } catch (error) {
        observer.error(error);
        return () => {};
      }
    });
  }

  private isValidTemperatureData(data: any): boolean {
    // Validate the data structure
    if (!data || typeof data !== 'object') {
      return false;
    }
    
    // Check for required fields and valid types
    if (data.temperature !== undefined) {
      const temp = data.temperature.current;
      if (typeof temp !== 'number' || isNaN(temp)) {
        return false;
      }
    }
    
    return true;
  }
}