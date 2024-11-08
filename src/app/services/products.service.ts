import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { InventoryItem } from '../models/products.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getProductDetails(compItemId: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/products/${compItemId}`,
      { headers: this.getHeaders() }
    );
  }

  getProducts(
    page: number,
    size: number,
    searchTerm: string,
  ): Observable<InventoryItem[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('search', searchTerm);

    console.log('Fetching products with token:', this.authService.getToken()); // Debug log

    return this.http
      .get<{ content: InventoryItem[] }>(`${this.apiUrl}/products`, {
        params,
        headers: this.getHeaders()
      })
      .pipe(
        map((response) =>
          response.content.map((item) => ({
            compItemId: item.compItemId,
            compDescription: item.compDescription,
            compInstructions: item.compInstructions,
            origin: item.origin,
            notes: item.notes,
            woh: item.woh,
            unitType: item.unitType,
            packSize: item.packSize,
            packLock: item.packLock,
            compCost: item.compCost,
            yield: item.yield,
            laborPackCost: item.laborPackCost,
            buyer: item.buyer,
            sixtySales: item.sixtySales,
            tenSales: item.tenSales,
            preOrderHours: item.preOrderHours,
          }))
        )
      );
  }
}