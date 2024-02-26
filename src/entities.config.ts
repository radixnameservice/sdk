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
            "component_tdx_2_1cqnsjhcp5j66j7w984wz3ef06s2mae3mhxng2gwstukt4v8ymmj3yc",
            "component_tdx_2_1czcwyutgezf90l0qgm6rzunemnzayg6cwmqly4z83m73zcyedj7zs7",
            "component_tdx_2_1cpq2m0vkytxpkyvvgljdkt66gjh0tps36erzxgagddst0s9kfxgue3",
            "component_tdx_2_1crljax8892zpulg6kvp9ja0pkuue6qfxxcfu5gl7cw3mrlzh4qlg72",
            "resource_tdx_2_1tkmfpvk8dn6gylespftlm9q8t5lg20g288mzfjeg5fs8e64m0wky2h",
            "resource_tdx_2_1nt388smvtrjsmpxpxst7l5fwgdx2zj8tm70ymu48mnhtacm5cqkvmc",
            "resource_tdx_2_1t485rzpnn0araq6tug3wszex5n9lkquve4s2frzrpysezmedqfsnp0",
            "resource_tdx_2_1thn7haezjvvl0ux2w3fqwltv5vefaccjt7pawm6hmfmfk0rcfmhntv",
            "resource_tdx_2_1n2ewhxgflesyadz7vp30kyxptnvkcclx7hvtgkjlrnarhz5nxa0upz",
            "resource_tdx_2_1tht0jjcq6hqnyf9jdvsku4z7v90fstmwf6wvaq9qjc7qvymalwtrtk",
            "resource_tdx_2_1nf64plfq9fsdjkhf8zfqkfxpcc56htgndekqacuelrqr0qyr9d53nl",
            "resource_tdx_2_1n20740hmx97dg5lquzhw2v6qapeqe5gtcu2dpdhk8f3j5umyh9a3gf",
            "resource_tdx_2_1ngwxvylwcn8mk8nevy8u75qzlvzuz2gdzvgc7xf8fzdupuy0efy2d2",
            "resource_tdx_2_1ntzjal9u92vjuz2jcgdchnt5735use7eqphe3g79ctdfwcqm0m07le",
            "resource_tdx_2_1t4vzpzqxjen9hf09tq6fgj2h304dl9nkzsqdpqa6wgy40rtry693rp",
            "resource_tdx_2_1tkvty7f4k798uzhxkp6feg2jencsud98ueezyhaqv46pnme7lz958t",
            "resource_tdx_2_1tklrnd6h0wpth9fajuh2thhvtw5w3h7nq43dj0c0p7h3254tcfacrr",
            "resource_tdx_2_1n2hw7hj4ffpp87584lvnctf8ylsp7xc06klknvmwsk7eetvmdztt8v",
            "resource_tdx_2_1ngln0q7wxtsdqgvsjc7hwa3fs2w9zcwnjnk8vwqka8lkg7cjvenewp",
            "resource_tdx_2_1t4kwlxxzkryp65rfewzljpm44zld37xyyvgk0spvrlad7lfkxj6x9a",
        ],
    },

    mainnet: {
        entities: [],
    }

};

export default config;
