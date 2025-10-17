# How to Run Firebase Functions Emulator

To run the Firebase Functions emulator, which is necessary for the admin panel and checkout page to function correctly, please follow these steps:

1.  **Open a new terminal window.** Do not close your current terminal where your frontend development server is running.

2.  **Navigate to the `functions` directory** of your project. You can do this using the `cd` command:

    ```bash
    cd functions
    ```

3.  **Start the Firebase Functions emulator** by running the following command:

    ```bash
    npm run serve
    ```

    This command will start the Firebase emulator, and you should see output indicating that the functions are running locally. Keep this terminal window open as long as you need the functions to be available.

Once the emulator is running, your application should be able to connect to the Firebase Functions endpoints without `ERR_CONNECTION_REFUSED` errors.