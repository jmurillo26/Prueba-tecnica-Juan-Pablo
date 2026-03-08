import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnChanges {

  @Input() message: string = '';
  @Input() type: 'success' | 'danger' | 'warning' | 'info' = 'info';

  visible: boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['message'] && this.message) {
      this.visible = true;
    }
  }

  close(): void {
    this.visible = false;
  }
}