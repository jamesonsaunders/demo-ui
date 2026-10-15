import { HttpErrorResponse } from '@angular/common/http';

export function getErrorMessage(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) {
      return "Couldn't reach the API.";
    }

    const body = err.error;
    if (typeof body === 'string' && body) {
      return body;
    }
    // ASP.NET validation problem details: { errors: { field: string[] } }
    if (body?.errors && typeof body.errors === 'object') {
      const messages = Object.values(body.errors)
        .flat()
        .filter((m) => typeof m === 'string');
      if (messages.length) {
        return messages.join(' ');
      }
    }
    if (typeof body?.detail === 'string' && body.detail) {
      return body.detail;
    }
    if (typeof body?.title === 'string' && body.title) {
      return body.title;
    }
    return err.message;
  }

  if (err instanceof Error) {
    return err.message;
  }

  return 'Something went wrong.';
}
