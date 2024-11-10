import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  // Define paths to exclude from authentication
  private excludedPaths: RegExp[] = [
    /\/api\/customers\/.*\/order-form/,
    /\/api\/customers\/.*\/order-exists/,
    /\/api\/customers\/.*\/order-confirmation/
  ];

  constructor(private authService: AuthService, private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Check if the request URL matches any excluded path
    const isExcluded = this.excludedPaths.some((pattern) => {
      const isMatch = pattern.test(request.url);
      console.log(`URL: ${request.url}, Pattern: ${pattern}, Excluded: ${isMatch}`);
      return isMatch;
    });

    // If the request is not excluded, add the Authorization header if a token is available
    if (!isExcluded) {
      const token = this.authService.getToken();

      if (token) {
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !isExcluded) {
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}