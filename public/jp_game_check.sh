#!/bin/bash

# Project Sekai & hololive Dreams connectivity test

Font_Red="\033[31m"
Font_Green="\033[32m"
Font_Suffix="\033[0m"

CURL_DEFAULT_OPTS=(-A 'Mozilla/5.0' --connect-timeout 5 --max-time 10)
if [[ ${USE_IPV6:-} == 1 ]]; then
    CURL_DEFAULT_OPTS+=(--ipv6)
fi

PROJECT_SEKAI_STATUS=0
HOLOLIVE_STATUS=0


function GameTest_ProjectSekai() {
    if [ "${USE_IPV6}" == 1 ]; then
        echo -e "\r Project Sekai: Colorful Stage:\t${Font_Red}IPv6 Is Not Currently Supported${Font_Suffix}"
        return
    fi

    local result=$(curl "${CURL_DEFAULT_OPTS[@]}" \
        -fsL \
        'https://game-version.sekai.colorfulpalette.org/1.8.1/3ed70b6a-8352-4532-b819-108837926ff5' \
        -w "%{http_code}" \
        -o /dev/null \
        -H "User-Agent: pjsekai/48 CFNetwork/1240.0.4 Darwin/20.6.0")


    case "$result" in
        200)
            echo -e "\r Project Sekai: Colorful Stage:\t${Font_Green}Yes${Font_Suffix}"
            PROJECT_SEKAI_STATUS=1
            ;;
        403)
            echo -e "\r Project Sekai: Colorful Stage:\t${Font_Red}No (Blocked)${Font_Suffix}"
            ;;
        000)
            echo -e "\r Project Sekai: Colorful Stage:\t${Font_Red}Failed (Network Error)${Font_Suffix}"
            ;;
        *)
            echo -e "\r Project Sekai: Colorful Stage:\t${Font_Red}Failed (HTTP ${result})${Font_Suffix}"
            ;;
    esac
}


function GameTest_HololiveDreams() {

    local result=$(curl "${CURL_DEFAULT_OPTS[@]}" \
        -fsL \
        'https://jp.game-hololive-dreams.com' \
        -w "%{http_code}" \
        -o /dev/null)


    case "$result" in
        404)
            echo -e "\r hololive Dreams:\t\t${Font_Green}Yes${Font_Suffix}"
            HOLOLIVE_STATUS=1
            ;;
        403)
            echo -e "\r hololive Dreams:\t\t${Font_Red}No (Blocked)${Font_Suffix}"
            ;;
        000)
            echo -e "\r hololive Dreams:\t\t${Font_Red}Failed (Network Error)${Font_Suffix}"
            ;;
        *)
            echo -e "\r hololive Dreams:\t\t${Font_Red}Failed (HTTP ${result})${Font_Suffix}"
            ;;
    esac
}


function GameTest_Summary() {

    if [ "${PROJECT_SEKAI_STATUS}" == 1 ] && [ "${HOLOLIVE_STATUS}" == 1 ]; then
        echo -e "\r Game Unlock Status:\t\t${Font_Green}Yes${Font_Suffix}"
    else
        echo -e "\r Game Unlock Status:\t\t${Font_Red}No${Font_Suffix}"
    fi

}


GameTest_ProjectSekai
GameTest_HololiveDreams
GameTest_Summary
