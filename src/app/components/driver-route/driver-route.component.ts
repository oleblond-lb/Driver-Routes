import { Component, OnInit, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { DriverRouteService } from '../../services/driver-route.service';
import { Observable, combineLatest } from 'rxjs';
import { DeliveryStop } from 'src/app/models/delivery-stop.model';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { map, switchMap } from 'rxjs/operators';
import { format } from 'date-fns';

@Component({
  selector: 'app-driver-route',
  templateUrl: './driver-route.component.html',
  styleUrls: ['./driver-route.component.css'],
})
export class DriverRouteComponent implements OnInit, AfterViewChecked {
  driverNames$: Observable<string[]>;
  deliveryRoute$: Observable<DeliveryStop[]> | undefined;
  deliveryDate: string = ''; // Provide a default value
  selectedDriverName: string = '';

  displayedColumns: string[] = [
    'deliveryAddress1',
    'address',
    'customerPhone',
    'actualArrivalTime',
  ];

  constructor(
    private driverRouteService: DriverRouteService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {
    this.setInitialDate();
    this.driverNames$ = this.driverRouteService.getDrivers();
  }

  ngOnInit(): void {
    this.driverRouteService.refreshDrivers();
    this.driverNames$.subscribe((driverNames) => {
      this.selectedDriverName = driverNames[0] || ''; // Select the first driver by default
      this.refreshDeliverRoute(this.selectedDriverName, this.deliveryDate);
    });
  }

  ngAfterViewChecked(): void {
    this.cdr.detectChanges();
  }

  setInitialDate(): void {
    const today = new Date();
    this.deliveryDate = format(today, 'yyyy-MM-dd');
  }

  refreshDeliverRoute(driverName: string, deliveryDate: string): void {
    const formattedDate = new Date(deliveryDate).toISOString().split('T')[0]; // Ensure date is formatted as YYYY-MM-DD
    this.deliveryRoute$ = this.driverRouteService.getDeliveryRoute(driverName, formattedDate).pipe(
      map(deliveryStops => this.calculateTimeDifferences(deliveryStops))
    );
  }

  hasArrived(deliveryRoute: DeliveryStop): void {
    this.driverRouteService.hasArrived(deliveryRoute.id.toString()).subscribe(
      () => {
        console.log('Delivery marked as arrived');
      },
      (error) => {
        console.error('Error marking delivery as arrived', error);
      }
    );
  }

  getGoogleMapsUrl(address2: string, address3: string): SafeUrl {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address2 + ' ' + address3)}`;
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  private calculateTimeDifferences(deliveryStops: DeliveryStop[]): DeliveryStop[] {
    for (let i = deliveryStops.length - 1; i > 0; i--) {
      const currentStop = deliveryStops[i];
      const previousStop = deliveryStops[i - 1];

      const currentTime = new Date(currentStop.plannedArrivalTime).getTime();
      const previousTime = new Date(previousStop.plannedArrivalTime).getTime();

      const timeDifferenceInMinutes = Math.round((currentTime - previousTime) / 60000);
      currentStop.timeDifference = timeDifferenceInMinutes;
    }

    if (deliveryStops.length > 0) {
      deliveryStops[0].timeDifference = undefined; // First row will have no time difference
    }

    return deliveryStops;
  }
}
