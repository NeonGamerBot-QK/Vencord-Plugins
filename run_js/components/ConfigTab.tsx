/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./styles.css";

import { DataStore } from "@api/index";
import { classNameFactory } from "@api/Styles";
import { SettingsTab, wrapTab } from "@components/VencordSettings/shared";
import { Margins } from "@utils/margins";
import { findByPropsLazy } from "@webpack";
import { Button, Card, Forms, React, Select, TabBar, TextArea, TextInput, useEffect,  useState } from "@webpack/common";


const cl = classNameFactory("vc-plugins-");
const InputStyles = findByPropsLazy("inputDefault", "inputWrapper");

const suffix = "runjs-";

function ConfigScriptsTab() {
    const [loading, setLoading] = useState(true);
    const [scripts, setScripts] = useState([]);
    useEffect(() => {
        DataStore.get(suffix + "scripts").then(async data => {
            setScripts(data ?? []);
            setLoading(false);
        });
    }, []);
   

    return (
        <div>
            <>
                {loading ? (
                    <div
                        className={Margins.top20}
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "100%",
                            fontSize: "1.5em",
                            color: "var(--text-muted)"
                        }}>Loading Scripts...</div>
                ) : (<>
                    <Forms.FormTitle tag="h2" style={{
                        overflowWrap: "break-word",
                        marginTop: 20,
                    }}>
                        Scripts
                    </Forms.FormTitle>
                    <Forms.FormText>
                        Add your custom JS scripts here. You can enable/disable them at any time.
                        - Deleting a script DOES NOT DO A PROMPT AND WILL BE DELETED IMMEDIATELY.
                        - Disabling a script will not run it, but it will still be saved.
                        - all scripts start disabled
                        - **!! USE AT YOUR OWN RISK ALL SCRIPTS WILL HAVE ACCESS TO VENCORD API!!**
                    </Forms.FormText>
                    <Button onClick={() => {
                        // @ts-ignore
                        setScripts([...scripts, { type: "choose", disabled: true }]);
                        // DataStore.set(suffix + "scripts", scripts);
                    }}
                        size={Button.Sizes.MEDIUM}
                        color={Button.Colors.PRIMARY}
                        look={Button.Looks.FILLED}
                        className={Margins.right8}>
                        Add Script
                    </Button>

                    <div className={cl("filter-controls")}>
                        {scripts.map((script: any, index) => (
                            <ScriptCard script={script} scripts={scripts} index={index} setScripts={setScripts} />
                        ))}
                    </div>
                    <div>
                    </div>
                </>)}
            </>
        </div >
    );
}
function ScriptCard({ index, script, setScripts, scripts }) {
    console.log(script);
    // debugger;
    const [scriptValue, setScriptValue] = useState(script.url ? script.url : script.script);
    return <Card style={{
        padding: ".5rem",
        marginBottom: ".5em",
        marginTop: ".5em",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--background-secondary-alt)"
    }} key={index}>
        <Forms.FormTitle tag="h2" style={{
            overflowWrap: "break-word",
            marginTop: 8,
        }}
            className="vce-theme-text">
            {index}
        </Forms.FormTitle>
        <div className="vce-theme-info">
            <div style={{
                justifyContent: "flex-start",
                flexDirection: "column"
            }}>
                {script.type === "choose" ? (
                    <div className={InputStyles.inputWrapper}>
                        <Select
                            options={[
                                { label: "Choose a script", value: "" },
                                { label: "URL", value: "url" },
                                { label: "Script", value: "script" },
                            ]}
                            serialize={String}
                            select={e => {
                                console.log(e);
                                // debugger;
                                scripts[index].type = e;
                                DataStore.set(suffix + "scripts", scripts).then(() => {
                                    setScripts([...scripts]);
                                });
                            }}
                            isSelected={v => false}
                            closeOnSelect={true}
                        />
                    </div>
                ) : script.type === "url" ? (
                    <div className={InputStyles.inputWrapper}>
                        <TextInput value={scriptValue} placeholder="https://..." onChange={e => setScriptValue(e)} />
                    </div>
                ) : script.type === "script" ? (
                    <div className={InputStyles.inputWrapper}>
                        <TextArea value={scriptValue} lang="js" onChange={e => setScriptValue(e)} />
                    </div>
                ) : null}
                {/* {theme.tags && (
                    <Forms.FormText>
                        {theme.tags.map(tag => (
                            <span className="vce-theme-info-tag">
                                {tag}
                            </span>
                        ))}
                    </Forms.FormText>
                )} */}
                <div style={{ marginTop: "8px", display: "flex", flexDirection: "row" }}>
                    {!script.disabled ? (
                        <Button
                            onClick={() => {
                                // @ts-ignore
                                scripts.find((_, i) => i === index).disabled = true;
                                DataStore.set(suffix + "scripts", scripts);
                                setScripts([...scripts]);

                                // Vencord.Settings.themeLinks = onlineThemeLinks;
                            }}
                            size={Button.Sizes.MEDIUM}
                            color={Button.Colors.RED}
                            look={Button.Looks.FILLED}
                            className={Margins.right8}
                        >
                            Disable Script
                        </Button>
                    ) : (
                        <Button
                            onClick={() => {
                                // @ts-ignore
                                const item = scripts.find((_, i) => i === index);
                                // if(item.type === "choose") return;
                                if (item.type === "url") {
                                    item.url = scriptValue;
                                }
                                if (item.type === "script") {
                                    item.script = scriptValue;
                                }
                                item.disabled = false;
                                DataStore.set(suffix + "scripts", scripts).then(() => {
                                    setScripts([...scripts]);
                                });

                            }}
                            size={Button.Sizes.MEDIUM}
                            color={Button.Colors.GREEN}
                            look={Button.Looks.FILLED}
                            className={Margins.right8}
                        >
                            Enable Script
                        </Button>
                    )}
                    <Button
                        onClick={() => {
                            // @ts-ignore
                            const filteredScripts = scripts.filter((_, i) => i !== index);
                            DataStore.set(suffix + "scripts", filteredScripts);
                            setScripts([...filteredScripts]);
                            // Vencord.Settings.themeLinks = onlineThemeLinks;
                        }}
                        size={Button.Sizes.MEDIUM}
                        color={Button.Colors.RED}
                        look={Button.Looks.FILLED}
                    >
                        Delete Script
                    </Button>
                    {/* <Button
                        onClick={async () => {
                            const author = await getUser(theme.author.discord_snowflake, theme.author.discord_name);
                            openModal(props => <ThemeInfoModal {...props} author={author} theme={theme} />);
                        }}
                        size={Button.Sizes.MEDIUM}
                        color={Button.Colors.BRAND}
                        look={Button.Looks.FILLED}
                    >
                        Theme Info
                    </Button> */}
                    {/* <Button
                        onClick={() => VencordNative.native.openExternal(`https://themes-delta.vercel.app/api/${theme.name}`)}
                        size={Button.Sizes.MEDIUM}
                        color={Button.Colors.LINK}
                        look={Button.Looks.LINK}
                    >
                        View Source
                    </Button> */}
                </div>
            </div>
        </div>
    </Card>;
}

function ConfigScripts() {
    const [currentTab, setCurrentTab] = useState(0);

    return (
        <SettingsTab title="JS Scripts">
            <TabBar
                type="top"
                look="brand"
                className="vc-settings-tab-bar"
                selectedItem={currentTab}
                onItemSelect={setCurrentTab}
            >
                <TabBar.Item
                    className="vc-settings-tab-bar-item"
                    id={0}
                >
                    JS Scripts
                </TabBar.Item>
            </TabBar>

            {<ConfigScriptsTab />}
        </SettingsTab>
    );
}

export default wrapTab(ConfigScripts, "JS Scripts");
