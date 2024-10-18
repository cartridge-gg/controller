# Fetching Usernames

Cartridge Controller allows you to fetch usernames associated with controller addresses. This feature is useful for displaying user-friendly identifiers in your game or application.

## Usage

To fetch usernames for controller addresses, you can use the `fetchControllers` method of the `Controller` class. Here's how to use it:

```typescript
import { Controller, ControllerAccounts } from '@cartridge/controller';

const controller = new Controller(options);
await controller.connect();

const addresses = ['0x123...', '0x456...', '0x789...'];
const usernames: ControllerAccounts = await controller.fetchControllers(addresses);
```

The `fetchControllers` method returns a promise that resolves to a `ControllerAccounts` object, which is a `Record<string, string>` where the keys are controller addresses and the values are the associated usernames.

## Limitations and Rate Limiting

When using the `fetchControllers` method, be aware of the following limitations and rate limiting measures:

1. **Maximum Addresses**: You can fetch usernames for up to 1000 addresses in a single call.

2. **Rate Limiting**: The API is rate-limited to 1 request per second to prevent overloading the server.

3. **Caching**: Results are cached to improve performance and reduce unnecessary API calls.

4. **Address Formatting**: The method handles both zero-padded and non-zero-padded addresses, but it's best to provide consistent, properly formatted addresses.


## Error Handling

The `fetchControllers` method may throw errors in the following cases:

- If you provide more than 1000 addresses in a single call.
- If there are network issues or the API is unavailable.
- If the controller is not properly connected or initialized.

Always wrap your calls to `fetchControllers` in a try-catch block to handle potential errors gracefully.

## Performance Considerations

To optimize performance when fetching usernames:

1. Batch your requests: Instead of making multiple calls for individual addresses, group them into a single call (up to 1000 addresses).
2. Utilize the built-in caching: Previously fetched usernames are cached, so subsequent requests for the same addresses will be faster.
3. Be mindful of the rate limit: If you need to fetch usernames for more than 1000 addresses, implement your own throttling mechanism to avoid hitting the rate limit.

By following these guidelines, you can efficiently fetch and display usernames for controller addresses in your Cartridge-powered application.
