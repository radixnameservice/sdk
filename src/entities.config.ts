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
            "package_tdx_2_1phnahn60cnwfc6uthhr279r8j2ua2mza9xvu5qrs5m7w2h3p5ckuda", // Storage Package
            "package_tdx_2_1p4e68p7fvcgl5fvq5qgh7mxu27haeuraadzad3hartgc9qdtru9kvt", // Logic Package
            "component_tdx_2_1cplgx5xmc7asvlnz6r2s0nxhuj50l3x49pkzzrpefgy6ygsgqz8rxl",
            "component_tdx_2_1cre56pdkpps7qlzyx4cqrjhp7zr92z8wj5ms7uxda442sjtq536hns",
            "component_tdx_2_1czcxddkdqa7kpz8ef8se9vdapps9g3squhrgz77vls6gskn2q7agfa",
            "component_tdx_2_1czjfqneyegzf2l5s48d70naewu9rqlrejryxelsyqhv3h0g9khulvc",
            "resource_tdx_2_1t4f6kvtzdaxjufeept09gaklcrrugmldk6q8hwnqedetahllngnlz6",
            "resource_tdx_2_1t464peye7wpqkt5jlpsgknakqax878njjt4vmuvkmrwg7946gr6qc6",
            "resource_tdx_2_1thk62nknvup2py48y5hrf0ww8x4h6muwcfyz4mljnrkdd3dyrkkr9g",
            "resource_tdx_2_1nf7mv6y5s0mpcqg5h6qfjtgmcq6jnswrynhxmgdkugyk37wt4d9rtn",
            "resource_tdx_2_1t44np222uky2e0e82u709jcjs9kmtcp53jmk9p7tk2rsc0mp99x9zk",
            "resource_tdx_2_1ngn7u29fvvdmqgtdqt2q50f5n4a2rpnd6jqewt4pkrdjr3p67e20qv",
            "resource_tdx_2_1nf8xkdxvwud0c5wev2q4c7f5egspxulmm95syxzs8tklvctcrmnaal",
            "resource_tdx_2_1ntngsv02jk6cyayufwh7a8l9u26w8hdfga3k69hn8nsklqapemlrft",
            "resource_tdx_2_1nfgr42eh9fcepn9jy9ue5qz8kgamrd55ekcqn49ytrvkeysslzceex",
            "resource_tdx_2_1ngzs5djwtsxc2p9gxwz4y5ghcsclenmm3rtjflrmkpmxpszfx0f9qa",
            "resource_tdx_2_1ng9z53wmzuuallm05dnnc703uqx60l563te4ztnsvc5gudkm3x7eda",
            "resource_tdx_2_1t53nuqc6paka9xq3h5j5g8tf53mkq97yx984ywd88l5dq7pe2kmztn",
        ],
    },

    mainnet: {
        entities: [],
    }

};

export default config;
