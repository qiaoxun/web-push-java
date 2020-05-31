package com.qiao.webpushjava.utils;

import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import org.jose4j.lang.JoseException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.concurrent.ExecutionException;

@Component
public class MessageSender {
    /** The Time to live of GCM notifications */
    private static final int TTL = 255;

    @Value("${webPush.gcmKey}")
    private String gcmKey;
    @Value("${webPush.publicKey}")
    private String publicKey;
    @Value("${webPush.privateKey}")
    private String privateKey;

    public void sendPushMessage(UserSubscription sub, byte[] payload) throws GeneralSecurityException, InterruptedException, JoseException, ExecutionException, IOException {
        PushService pushService = new PushService(gcmKey);

        // Or create a GcmNotification, in case of Google Cloud Messaging
        Notification notification = new Notification(
                sub.getEndpoint(),
                sub.getUserPublicKey(),
                sub.getAuthAsBytes(),
                payload,
                TTL
        );
        // Instantiate the push service with a GCM API key
        pushService.setPrivateKey(privateKey);
        pushService.setPublicKey(publicKey);
        // Send the notification
        pushService.send(notification);
    }
}
