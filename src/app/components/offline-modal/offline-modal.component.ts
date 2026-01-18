import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-offline-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './offline-modal.component.html',
  styleUrls: ['./offline-modal.component.scss']
})
export class OfflineModalComponent {
  @Input() isOffline: boolean = false;
}
