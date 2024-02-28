import { NetworkT } from "./utils/gateway.utils";

type EntitiesT = string[];

type EntitiesConfigT = {

    [key in NetworkT]: {
        entities: EntitiesT
    };

};

const config: EntitiesConfigT = {

    stokenet: {
        entities: [
            "component_tdx_2_1cztxptvwsdx5tkrzjacezuazd6y6a5leaeruvw82v0le0p6nrad49x",
            "component_tdx_2_1czfp6majl2fqqxuu5hmgc9jtje3md63uc2e5f6mvr3lad7fa2vhpk0",
            "component_tdx_2_1crmuw7665aeykrpzteavdynnuuvlgvcg66epykr4d5a9rnnmyth84l",
            "component_tdx_2_1czc6ks2a3vknhw0dgdxuehkavrjwq9arnzv5a402n5ey76hs895qg7",
            "resource_tdx_2_1t5p9vtez2ek3qnf6vcyqg5zt5ecgcyswjp9f9dplgln98247d9zeyx",
            "resource_tdx_2_1ngljln99wg0c7unlrgf9gqc08fzseufaw6mv08se6vyw8savy3tpum",
            "resource_tdx_2_1t4qlaauahwfrv2k3c54d880yzzznxkdat6sg8r4pzqfe5an9fp425a",
            "resource_tdx_2_1thls7ga6tw9dstu77r7zc8zy8ratxm48pu39ehm62agwsmshcx24hp",
            "resource_tdx_2_1nt8wvqwp6pfcugqw9jfd4wejte2rpwunl08epunh5nmpd9mmaqh9ch",
            "resource_tdx_2_1t45gkljpjep0e07ruh4y250u6z6whprdgu6xxrknzdp93xdexl94sp",
            "resource_tdx_2_1n2d5xw2ts86pydfypuan5k9t5aeg53r2wlfzmj5davmgkz9vfyg3xt",
            "resource_tdx_2_1nf78z258l86yfy9k8vqfljh5ldwdj5ug6ugyvyup340scmerygq46e",
            "resource_tdx_2_1nf5srv2jv22p39a6d83w8h7m3zfja58m42pcargkkyw8c382ux45qx",
            "resource_tdx_2_1n2mlf42kp07pdm6vgdn9qwhh75muxrkyfdm38mq7eyrt943a0nak2l",
            "resource_tdx_2_1thwj50lcjq3wk3520gtngdydxmt099zrrvwx3fr9j7c4vy3x8j35nf",
            "resource_tdx_2_1t48f74kun5a2z7fac4m5ruv32l2gdqvycat8n4c9quchc93wz454sq",
            "resource_tdx_2_1tkgws2g8v86kwaurppny860pmxa3rmuspcv6m6rnmdehl2uqw0cgqe",
            // "resource_tdx_2_1nff5efah5cvdsskuh86dv2fecqeltsr5m8zp3tzdhzljvktnepnkyw",
            "resource_tdx_2_1ngqyr697f7c3q4lwfax2ndcg3nx6pknleuzenncfcmtkmuuulw4gwg",
            "resource_tdx_2_1nfhwqkem096c0gpdfcnvmq0chdnlk0632pn6gqdnx6w2zf4mkd4p07",
            "resource_tdx_2_1thxzxt0grhqpccgw9rufhpkmxwkk9n549rwmsfc98qnegkk39jqv6n",
        ],
    },

    mainnet: {
        entities: [
            "component_rdx1cqjpuxrsdvy7pjjym20h3fd96dpgf3nn8sejyu33kk0djm028gr3pt",
            "component_rdx1czwr8xllz9ukgn6w3tst9u3ydgyv9yr9u5hs3dvy6thkgspfv2qqev",
            "component_rdx1czuwlrcxf3pam04q25fxjdxcfczfdvn9z4p5h60upyyzxyle95awe9",
            "component_rdx1cp2ua070g0wxwf78exl7mdhs3qzwazsqaz65d4j5r4ggjvqfc37a79",
            "resource_rdx1tkp8ptd9wmac20lt7als4wrdkzf5t60zlnplwdz09200xs2kwcmt8d",
            "resource_rdx1nf7y38stfprral843wajhpwc9thhehejep64efe0yhrkks5t3wvwk3",
            "resource_rdx1t5psf5t5hupsuuvuw3ra0m7hgnvm93yaa5aqg2afnex42pqsmcfyec",
            "resource_rdx1th4j8c00c2escx9g0wcsqhu3p7jh7fu9gh3qdyqqkpdvsdj6xn0g5c",
            "resource_rdx1ngdf99zn80ytvu443l6kmk448mg9dpk6qt8h0ezxr7c62yemtl5928",
            "resource_rdx1tkxknmk2j360v2el84hen2k8jkhxlgtw980lfq73kszmjqm9rjxrz2",
            "resource_rdx1n2aktr583etff2502ek6s6a6sevvnvv63zzgstxgqvx5zh2wg0ckct",
            "resource_rdx1n2dd0w53zpdlqdz65vpymygj8a60vqnggyuxfpfdldjmy2224x020q",
            "resource_rdx1nf7lt68zan0fvlfqqrtnxasxjmv877ncnr2kpdl69t076sw4whjc27",
            "resource_rdx1n2mjeg3z58y8ka8kz6ftpwef5cyfwc5fcvsudpuvxn9jxyn48ff0tn",
            "resource_rdx1t5v0p43wlsd938zukmlqtwlafa6u8u8utyxfcthp0hq579dfhp6hyk",
            "resource_rdx1tken5hue8vrf7dp5rmy73296efrw7820jlvu0kgjxlfwphk342km0h",
            "resource_rdx1t4h39eah5ax0dxu94esg04amnwak49c5xzvthn4k0khhs5dx88qa3s",
            // "resource_rdx1ng7k3v32y6zyyy98ctdp3deug9sdfhjy0u6f49yqr9m8l3zznrtfx9",
            "resource_rdx1ng4fj3h59nx6gm90p3xrxkrg2e6xa3epjnwlvaa6ar4a70gcfr23f0",
            "resource_rdx1nfh6r0p8fy9qxr3arud0twj0v4vuptcxhuxyp0nuagx929wxy0nfz0",
            "resource_rdx1t4qzvfn32unx3d3cwsf4whc20qzg4xekdut0yrtdvahhj3fd7kxhcs",
        ],
    }

};

export default config;
