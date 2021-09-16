const Config = require("./config");
const axios = require("axios");
//const Queries = require("./queries.js");

class EsiApi {
    static BasicAuthToken = Buffer.from(`${Config.ESI.ClientID}:${Config.ESI.SecretKey}`).toString("base64");

    static async fetchToken(code) {
        const data = { grant_type: "authorization_code", code };
        const res = await axios.post("https://login.eveonline.com/oauth/token", data, {
            headers: {
                Authorization: `Basic ${EsiApi.BasicAuthToken}`,
            },
        });

        const { access_token: accessToken, refresh_token: refreshToken } = res.data;
        return { accessToken, refreshToken };
    }

    static async verifyToken(accessToken) {
        const res = await axios.get("https://login.eveonline.com/oauth/verify", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const { Scopes: scopes, CharacterID: characterID } = res.data;
        return { scopes, characterID };
    }

    static async refreshToken(_refreshToken) {
        const data = { grant_type: "refresh_token", refresh_token: _refreshToken };
        const res = await axios.post("https://login.eveonline.com/oauth/token", data, {
            headers: {
                Authorization: `Basic ${EsiApi.BasicAuthToken}`,
            },
        });

        const { access_token: accessToken, refresh_token: refreshToken } = res.data;
        return { accessToken, refreshToken };
    }

    static async GetCharacterInfo(charID) {
        return (await axios.get(`https://esi.evetech.net/latest/characters/${charID}/`, {})).data;
    }
    static async GetCorporationInfo(corpID) {
        return (await axios.get(`https://esi.evetech.net/latest/corporations/${corpID}/`, {})).data;
    }
    static async GetAllianceInfo(allianceID) {
        if(!allianceID){
            console.error("invalid alliance ID");
            return;
        }
        return (await axios.get(`https://esi.evetech.net/latest/alliances/${allianceID}/`, {})).data;
    }
    static async GetStructureInfo(structureID, esiKey) {
        console.log(esiKey);
        const res = await axios.get(`https://esi.evetech.net/latest/universe/structures/${structureID}/`, {
            headers: {
                Authorization: `Bearer ${esiKey.AccessToken}`,
            },
        });

        return res.data;
    }

    static async GetMoonInfo(moonID) {
        return await axios.get(`https://esi.evetech.net/latest/universe/moons/${moonID}/`, {});
    }
    static async GetSystemInfo(systemID) {
        return await axios.get(`https://esi.evetech.net/latest/universe/systems/${systemID}/`, {});
    }
    static async GetConstellationInfo(constellationID) {
        return await axios.get(`https://esi.evetech.net/latest/universe/constellations/${constellationID}/`, {});
    }
    static async GetRegionInfo(regionID) {
        return await axios.get(`https://esi.evetech.net/latest/universe/regions/${regionID}/`, {});
    }


    static async refreshEsiKey(esiKey) {
        const { accessToken, refreshToken } = await EsiApi.refreshToken(esiKey.RefreshToken);
        await Queries.updateEsiKeyTokens(esiKey.RefreshToken, accessToken, refreshToken);
    };
}

module.exports = EsiApi;