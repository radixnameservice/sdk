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
            "component_tdx_2_1czv027dllgm97qugtcflmx6atv6cckfmuhzj0vfatnxpeqycrlszyx",
            "component_tdx_2_1cr52vfqau80tfcgteeatk5g4mynfze27h58fc7z4tg60c444ym68c4",
            "component_tdx_2_1czxm58x026djrlcvu507sultpgluzsxvq8534y6q5f88plsun4735p",
            "component_tdx_2_1czdx4pzw9wvuknwwhucj4qapzfeg02r98zc9e9jmjen9ahxals5fhj",
            "resource_tdx_2_1t4gsn284mldrktftmc7n8vyftnpxl47mfqw6lphawu3jrask4dzgv0",
            "resource_tdx_2_1ng8hhtvw30st6hsx3p2hsd3x30vpa3g6zfg6aynwzckmwea755rk68",
            "resource_tdx_2_1t4n7cnvh7e5r9dlz90q8ld3sk6ahqvuhum7d0ph597mmzcspfpsnqe",
            "resource_tdx_2_1t584lgzrdlx3mru4tgft47lxad8gk8g0r7sdpmd0xmw4flke8rltfe",
            "resource_tdx_2_1ntxu6mgp4y4fgqaemw5clr9rxn0ywu4grtetwrwwa425mvjmv492w9",
            "resource_tdx_2_1thaenny46ktn3shmjnauvkumcn8t4jj6qn22a0mu42tfsjc0jc34xl",
            "resource_tdx_2_1nfpwr0gxz7jd98x67lg8vsejyakzjxu9gwrrckf77djt0y2rk8rtgf",
            "resource_tdx_2_1n2khpncgpmq574yp0ehu2ljm5728kmjsxgp4jueqvsgajm4dd3f23u",
            "resource_tdx_2_1ntv4j0lshj74gwtw4f9esd6tzepwtnk57qa8vrupjlzhcdgnzraphr",
            "resource_tdx_2_1n2x8k0x38g42scm3xr0e7v37f4yq0e4a0exyand3ds8gdt2qq2vjd9",
            "resource_tdx_2_1t59p303xh4hrpt5ac5m0r32zusxsmqqg3kamm4s6z4muutfjy43d0u",
            "resource_tdx_2_1t447h4u4a5c4aq493uqylefgh2wtmf587z3t0wn5wzls8ge62u8pmz",
            "resource_tdx_2_1t4lr04w7juygrh4u4gymwddvyh974acux7fggt86saq4h0a2w5spu2",
            "resource_tdx_2_1ntwq8xdp2kgd68h0qpw6rqaz23sh3sef5jryrtgsy000c5teqg60au",
            "resource_tdx_2_1ntjcjvukhkmlky6guvndypxah8mvcngz342wz57nhmpehq6r3rssjv",
            "resource_tdx_2_1thjvc4vvk3qu0m35jdxsq3pv0sn7hjlrnat6za00x70zh4plevvyu0",
        ],
    },

    mainnet: {
        entities: [],
    }

};

export default config;
