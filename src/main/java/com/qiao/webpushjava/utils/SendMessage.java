package com.qiao.webpushjava.utils;

import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import org.jose4j.lang.JoseException;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.concurrent.ExecutionException;

public class SendMessage {
    /** The Time to live of GCM notifications */
    private static final int TTL = 255;
    private static String gcmKey = "BB9w2fVC4ernqZTbukecIE_Kzvbqiqa7nVRjVYqUZbjGzk62amKq6c3XFIMIJI_PUlig8iBpcC_KQe9I7Xysfzg";
    private static String publicKey = "BJ_I4k_oiXowxpxJ0jvkPwN451dbIZOfbwSqJU5BrhLTBwxSXBSeNElTte9DJENb3cANDLdmPt3rPgMvkDkbtfA";
    private static String privateKey = "7u6fpCePYhEZ06hoI3lhuqV_3VkM5VigOWBUWoGANpU";

    public static void sendPushMessage(Subscription sub, byte[] payload) throws GeneralSecurityException, InterruptedException, JoseException, ExecutionException, IOException {

        // Figure out if we should use GCM for this notification somehow
        boolean useGcm = true;
        Notification notification;
        PushService pushService;

        if (!useGcm) {
            // Create a notification with the endpoint, userPublicKey from the subscription and a custom payload
            notification = new Notification(
                    sub.getEndpoint(),
                    sub.getUserPublicKey(),
                    sub.getAuthAsBytes(),
                    payload
            );

            // Instantiate the push service, no need to use an API key for Push API
            pushService = new PushService();
        } else {
            // Or create a GcmNotification, in case of Google Cloud Messaging
            notification = new Notification(
                    sub.getEndpoint(),
                    sub.getUserPublicKey(),
                    sub.getAuthAsBytes(),
                    payload,
                    TTL
            );

            // Instantiate the push service with a GCM API key
            pushService = new PushService(gcmKey);
            pushService.setPrivateKey(privateKey);
            pushService.setPublicKey(publicKey);
        }

        // Send the notification
        pushService.send(notification);
    }
}
