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
        entities: [],
    }

};

export default config;
