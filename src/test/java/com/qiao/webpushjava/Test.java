package com.qiao.webpushjava;

import java.util.HashMap;
import java.util.Map;

public class Test {

    @org.junit.Test
    public void test() {
        Map<String, String> map = new HashMap<>();
        map.put("title", "Test");
        System.out.println(map.toString());
    }

}
