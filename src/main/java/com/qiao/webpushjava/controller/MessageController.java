package com.qiao.webpushjava.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.qiao.webpushjava.model.WebPushSubscription;
import com.qiao.webpushjava.utils.MessageSender;
import com.qiao.webpushjava.utils.UserSubscription;
import org.jose4j.lang.JoseException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/message")
public class MessageController {

    private Map<String, WebPushSubscription> subscriptions = new ConcurrentHashMap<>();

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private MessageSender messageSender;

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
    public String notifyAll(@RequestBody String param) throws GeneralSecurityException, IOException, JoseException, ExecutionException, InterruptedException {
        for (WebPushSubscription webPushSubscription: subscriptions.values()) {
            UserSubscription userSubscription = new UserSubscription();
            userSubscription.setEndpoint(webPushSubscription.getEndpoint());
            userSubscription.setAuth(webPushSubscription.getAuth());
            userSubscription.setKey(webPushSubscription.getKey());
            messageSender.sendPushMessage(userSubscription, param.getBytes(StandardCharsets.UTF_8));
        }
        return param;
    }

}
