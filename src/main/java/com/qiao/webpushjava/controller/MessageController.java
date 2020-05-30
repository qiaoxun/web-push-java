package com.qiao.webpushjava.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.qiao.webpushjava.model.WebPushMessage;
import com.qiao.webpushjava.model.WebPushSubscription;
import com.qiao.webpushjava.utils.SendMessage;
import com.qiao.webpushjava.utils.Subscription;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import org.jose4j.lang.JoseException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.security.spec.InvalidKeySpecException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/message")
public class MessageController {

    private Map<String, WebPushSubscription> subscriptions = new ConcurrentHashMap<>();
//    private PushService pushService = new PushService();
//    private String publicKey = "BJ_I4k_oiXowxpxJ0jvkPwN451dbIZOfbwSqJU5BrhLTBwxSXBSeNElTte9DJENb3cANDLdmPt3rPgMvkDkbtfA";
//
//    {
//        try {
//            pushService.setPublicKey("BJ_I4k_oiXowxpxJ0jvkPwN451dbIZOfbwSqJU5BrhLTBwxSXBSeNElTte9DJENb3cANDLdmPt3rPgMvkDkbtfA");
//            pushService.setPrivateKey("7u6fpCePYhEZ06hoI3lhuqV_3VkM5VigOWBUWoGANpU");
//            pushService.setGcmApiKey("BB9w2fVC4ernqZTbukecIE_Kzvbqiqa7nVRjVYqUZbjGzk62amKq6c3XFIMIJI_PUlig8iBpcC_KQe9I7Xysfzg");
//        } catch (NoSuchAlgorithmException e) {
//            e.printStackTrace();
//        } catch (NoSuchProviderException e) {
//            e.printStackTrace();
//        } catch (InvalidKeySpecException e) {
//            e.printStackTrace();
//        }
//    }

    @Autowired
    private ObjectMapper objectMapper;

    @PostMapping("/subscribe")
    public String subscribe(@RequestBody WebPushSubscription subscription) {
        subscriptions.put(subscription.getEndpoint(), subscription);
        return "{'id':'id_101'}";
    }

    @PostMapping("/unsubscribe")
    public void unsubscribe(WebPushSubscription subscription) {
        subscriptions.remove(subscription.getEndpoint());
    }

    @PostMapping("/notify-all")
    public WebPushMessage notifyAll(@RequestBody WebPushMessage message) throws GeneralSecurityException, IOException, JoseException, ExecutionException, InterruptedException {
        for (WebPushSubscription webPushSubscription: subscriptions.values()) {
            System.out.println(webPushSubscription.getEndpoint());
            System.out.println(webPushSubscription.getAuth());
//            Notification notification = new Notification(
//                    subscription.getEndpoint(),
//                    publicKey,
//                    subscription.getAuth(),
//                    objectMapper.writeValueAsBytes(message));

            Subscription subscription = new Subscription();
            subscription.setEndpoint(webPushSubscription.getEndpoint());
            subscription.setAuth(webPushSubscription.getAuth());
            subscription.setKey(webPushSubscription.getKey());
            SendMessage.sendPushMessage(subscription, objectMapper.writeValueAsBytes(message));
//            pushService.send(notification);
        }

        return message;
    }

}
