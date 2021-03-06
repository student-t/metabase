import React, { Component } from 'react'
import cxs from 'cxs'
import { connect } from 'react-redux'

import { saturated } from 'metabase/lib/colors'

import { fetchCardXray } from 'metabase/xray/xray'
import { getLoadingStatus } from 'metabase/xray/selectors'
import Icon from 'metabase/components/Icon'
import Tooltip from 'metabase/components/Tooltip'
import LoadingAndErrorWrapper from 'metabase/components/LoadingAndErrorWrapper'
import Visualization from 'metabase/visualizations/components/Visualization'

import { XRayPageWrapper, Heading } from 'metabase/xray/components/XRayLayout'
import Periodicity from 'metabase/xray/components/Periodicity'

import { hasXray, loadingMessages } from 'metabase/xray/utils'
import LoadingAnimation from 'metabase/xray/components/LoadingAnimation'

type Props = {
    fetchCardXray: () => void,
    isLoading: boolean,
    xray: {}
}

const GrowthRateDisplay = ({ period }) =>
    <div className="Grid-cell">
        <div className="p4 border-right">
            <h4 className="flex align-center">
                {period.label}
                { period.description && (
                    <Tooltip tooltip={period.description}>
                        <Icon name="infooutlined" style={{ marginLeft: 8 }} size={14} />
                    </Tooltip>
                )}
            </h4>
            <h1
                className={cxs({
                    color: period.value > 0 ? saturated.green : saturated.red
                })}
            >
                {period.value && (period.value * 100).toFixed(2)}%
            </h1>
        </div>
    </div>

class CardXRay extends Component {
    props: Props

    state = {
        error: null
    }

    async componentWillMount () {
        const { cardId, cost } = this.props.params
        try {
            await this.props.fetchCardXray(cardId, cost)
        } catch (error) {
            this.setState({ error })
        }
    }


    render () {
        const { xray, isLoading } = this.props
        const { error } = this.state
        return (
            <LoadingAndErrorWrapper
                loading={isLoading || !hasXray(xray)}
                error={error}
                noBackground
                loadingMessages={loadingMessages}
                loadingScenes={[<LoadingAnimation />]}
            >
                { () =>
                    <XRayPageWrapper>
                        <div className="mt4 mb2">
                            <h1 className="my3">{xray.features.card.name} X-ray</h1>
                        </div>
                        <Heading heading="Growth rate" />
                        <div className="bg-white bordered rounded shadowed">
                            <div className="Grid Grid--1of4 border-bottom">
                                { xray.features.DoD.value && (
                                    <GrowthRateDisplay period={xray.features.DoD} />
                                )}
                                { xray.features.WoW.value && (
                                    <GrowthRateDisplay period={xray.features.WoW} />
                                )}
                                { xray.features.MoM.value && (
                                    <GrowthRateDisplay period={xray.features.MoM} />
                                )}
                                { xray.features.YoY.value && (
                                    <GrowthRateDisplay period={xray.features.YoY} />
                                )}
                            </div>
                            <div className="full">
                                <div className="py1 px2" style={{ height: 320}}>
                                    <Visualization
                                        series={[
                                            {
                                                card: xray.features.card,
                                                data: xray.dataset
                                            },
                                            {
                                                card: {
                                                    display: 'line',
                                                    name: 'Growth Trend',
                                                    visualization_settings: {

                                                    }
                                                },
                                                data: xray.features['linear-regression'].value
                                            }
                                        ]}
                                        className="full-height"
                                    />
                                </div>
                            </div>
                        </div>

                        <Heading heading={xray.features['growth-series'].label} />
                        <div className="full">
                            <div className="bg-white bordered rounded shadowed" style={{ height: 220}}>
                                <Visualization
                                    series={[
                                        {
                                            card: {
                                                display: 'line',
                                                name: 'Trend',
                                                visualization_settings: {

                                                }
                                            },
                                            data: {
                                                ...xray.features['growth-series'].value,
                                                // multiple row value by 100 to display as a %
                                                rows: xray.features['growth-series'].value.rows.map(row =>
                                                    [row[0], row[1]*100]
                                                )
                                            }
                                        }
                                    ]}
                                    className="full-height"
                                />
                            </div>
                        </div>

                        { xray.constituents[0] && (
                            <Periodicity xray={Object.values(xray.constituents)[0]} />
                        )}

                        <Heading heading={xray.features['seasonal-decomposition'].label} />
                        <div className="full">
                            <div className="bg-white bordered rounded shadowed" style={{ height: 220}}>
                                <Visualization
                                    series={[
                                        {
                                            card: {
                                                display: 'line',
                                                name: 'Trend',
                                                visualization_settings: {}
                                            },
                                            data: xray.features['seasonal-decomposition'].value.trend
                                        },
                                        {
                                            card: {
                                                display: 'line',
                                                name: 'Seasonal',
                                                visualization_settings: {}
                                            },
                                            data: xray.features['seasonal-decomposition'].value.seasonal
                                        },
                                        {
                                            card: {
                                                display: 'line',
                                                name: 'Residual',
                                                visualization_settings: {}
                                            },
                                            data: xray.features['seasonal-decomposition'].value.residual
                                        }
                                    ]}
                                    className="full-height"
                                />
                            </div>
                        </div>
                    </XRayPageWrapper>
                }
            </LoadingAndErrorWrapper>
        )
    }
}

const mapStateToProps = state => ({
    xray: state.xray.xray,
    isLoading: getLoadingStatus(state)
})

const mapDispatchToProps = {
    fetchCardXray
}

export default connect(mapStateToProps, mapDispatchToProps)(CardXRay)
