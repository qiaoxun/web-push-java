package com.qiao.webpushjava;

import com.beust.jcommander.JCommander;
import com.beust.jcommander.ParameterException;
import nl.martijndwars.webpush.cli.commands.GenerateKeyCommand;
import nl.martijndwars.webpush.cli.commands.SendNotificationCommand;
import nl.martijndwars.webpush.cli.handlers.GenerateKeyHandler;
import nl.martijndwars.webpush.cli.handlers.SendNotificationHandler;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.junit.Test;

import java.security.Security;

public class VapidGenerator {
    private static final String GENERATE_KEY = "generate-key";
    private static final String SEND_NOTIFICATION = "send-notification";

    @Test
    public void testGenerate() {
        generateKey(GENERATE_KEY);
    }

    public void generateKey(String... args) {
        Security.addProvider(new BouncyCastleProvider());

        GenerateKeyCommand generateKeyCommand = new GenerateKeyCommand();
        SendNotificationCommand sendNotificationCommand = new SendNotificationCommand();

        JCommander jCommander = JCommander.newBuilder()
                .addCommand(GENERATE_KEY, generateKeyCommand)
                .addCommand(SEND_NOTIFICATION, sendNotificationCommand)
                .build();

        try {
            jCommander.parse(args);

            if (jCommander.getParsedCommand() != null) {
                switch (jCommander.getParsedCommand()) {
                    case GENERATE_KEY:
                        new GenerateKeyHandler(generateKeyCommand).run();
                        break;
                    case SEND_NOTIFICATION:
                        new SendNotificationHandler(sendNotificationCommand).run();
                        break;
                }
            } else {
                jCommander.usage();
            }
        } catch (ParameterException e) {
            e.usage();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
